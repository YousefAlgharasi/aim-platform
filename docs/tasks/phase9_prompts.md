# Phase 9 Task Prompts — AI Teacher Voice Mode

Repo target path: `docs/tasks/phase9_prompts.md`

Phase 9 builds AI Teacher Voice Mode on top of Phase 8 Text Mode. Flutter must never call STT/TTS/AI providers directly. UI tasks must use AIM Mobile Design System and respect RTL/Arabic behavior.


## #P9-001 — Create Phase 9 Voice Mode Charter

**Group:** Group A — Phase 9 Control & Scope

**Priority:** P0

**Branch:** `phase9/P9-001-voice-mode-charter`

**Dependency:** P8-100

**Output:** `docs/phase-9/voice-mode-charter.md`


### Description
Create Phase 9 Voice Mode Charter for Phase 9 Voice Mode. This task belongs to Group A — Phase 9 Control & Scope and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Phase 9 Voice Mode Charter with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-001.
- Use branch `phase9/P9-001-voice-mode-charter`.
- Produce output: `docs/phase-9/voice-mode-charter.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/voice-mode-charter.md`.
- Implementation follows `phase9/P9-001-voice-mode-charter` scope and task P9-001 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-001 — Create Phase 9 Voice Mode Charter for AIM Phase 9 Voice Mode. Use branch `phase9/P9-001-voice-mode-charter` and create/update `docs/phase-9/voice-mode-charter.md`. Dependency: P8-100. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-001 complete. Branch: phase9/P9-001-voice-mode-charter. Output: docs/phase-9/voice-mode-charter.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-002 — Create Phase 9 Task Execution Rules

**Group:** Group A — Phase 9 Control & Scope

**Priority:** P0

**Branch:** `phase9/P9-002-phase-9-task-rules`

**Dependency:** P9-001

**Output:** `docs/phase-9/task-execution-rules.md`


### Description
Create Phase 9 Task Execution Rules for Phase 9 Voice Mode. This task belongs to Group A — Phase 9 Control & Scope and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Phase 9 Task Execution Rules with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-002.
- Use branch `phase9/P9-002-phase-9-task-rules`.
- Produce output: `docs/phase-9/task-execution-rules.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/task-execution-rules.md`.
- Implementation follows `phase9/P9-002-phase-9-task-rules` scope and task P9-002 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-002 — Create Phase 9 Task Execution Rules for AIM Phase 9 Voice Mode. Use branch `phase9/P9-002-phase-9-task-rules` and create/update `docs/phase-9/task-execution-rules.md`. Dependency: P9-001. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-002 complete. Branch: phase9/P9-002-phase-9-task-rules. Output: docs/phase-9/task-execution-rules.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-003 — Define Voice Mode Scope and Out-of-Scope

**Group:** Group A — Phase 9 Control & Scope

**Priority:** P0

**Branch:** `phase9/P9-003-voice-scope-boundaries`

**Dependency:** P9-001

**Output:** `docs/phase-9/voice-scope-boundaries.md`


### Description
Define Voice Mode Scope and Out-of-Scope for Phase 9 Voice Mode. This task belongs to Group A — Phase 9 Control & Scope and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Define Voice Mode Scope and Out-of-Scope with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-003.
- Use branch `phase9/P9-003-voice-scope-boundaries`.
- Produce output: `docs/phase-9/voice-scope-boundaries.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/voice-scope-boundaries.md`.
- Implementation follows `phase9/P9-003-voice-scope-boundaries` scope and task P9-003 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-003 — Define Voice Mode Scope and Out-of-Scope for AIM Phase 9 Voice Mode. Use branch `phase9/P9-003-voice-scope-boundaries` and create/update `docs/phase-9/voice-scope-boundaries.md`. Dependency: P9-001. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-003 complete. Branch: phase9/P9-003-voice-scope-boundaries. Output: docs/phase-9/voice-scope-boundaries.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-004 — Document No Client STT/TTS/AI Provider Rule

**Group:** Group A — Phase 9 Control & Scope

**Priority:** P0

**Branch:** `phase9/P9-004-no-client-provider-rule`

**Dependency:** P9-003

**Output:** `docs/phase-9/no-client-provider-rule.md`


### Description
Document No Client STT/TTS/AI Provider Rule for Phase 9 Voice Mode. This task belongs to Group A — Phase 9 Control & Scope and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Document No Client STT/TTS/AI Provider Rule with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-004.
- Use branch `phase9/P9-004-no-client-provider-rule`.
- Produce output: `docs/phase-9/no-client-provider-rule.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/no-client-provider-rule.md`.
- Implementation follows `phase9/P9-004-no-client-provider-rule` scope and task P9-004 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-004 — Document No Client STT/TTS/AI Provider Rule for AIM Phase 9 Voice Mode. Use branch `phase9/P9-004-no-client-provider-rule` and create/update `docs/phase-9/no-client-provider-rule.md`. Dependency: P9-003. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-004 complete. Branch: phase9/P9-004-no-client-provider-rule. Output: docs/phase-9/no-client-provider-rule.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-005 — Document No AIM Authority Change Rule

**Group:** Group A — Phase 9 Control & Scope

**Priority:** P0

**Branch:** `phase9/P9-005-no-aim-authority-change-rule`

**Dependency:** P9-003

**Output:** `docs/phase-9/no-aim-authority-change-rule.md`


### Description
Document No AIM Authority Change Rule for Phase 9 Voice Mode. This task belongs to Group A — Phase 9 Control & Scope and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Document No AIM Authority Change Rule with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-005.
- Use branch `phase9/P9-005-no-aim-authority-change-rule`.
- Produce output: `docs/phase-9/no-aim-authority-change-rule.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/no-aim-authority-change-rule.md`.
- Implementation follows `phase9/P9-005-no-aim-authority-change-rule` scope and task P9-005 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-005 — Document No AIM Authority Change Rule for AIM Phase 9 Voice Mode. Use branch `phase9/P9-005-no-aim-authority-change-rule` and create/update `docs/phase-9/no-aim-authority-change-rule.md`. Dependency: P9-003. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-005 complete. Branch: phase9/P9-005-no-aim-authority-change-rule. Output: docs/phase-9/no-aim-authority-change-rule.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-006 — Create Voice Data Flow Document

**Group:** Group A — Phase 9 Control & Scope

**Priority:** P0

**Branch:** `phase9/P9-006-voice-data-flow`

**Dependency:** P9-003

**Output:** `docs/phase-9/voice-data-flow.md`


### Description
Create Voice Data Flow Document for Phase 9 Voice Mode. This task belongs to Group A — Phase 9 Control & Scope and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Data Flow Document with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-006.
- Use branch `phase9/P9-006-voice-data-flow`.
- Produce output: `docs/phase-9/voice-data-flow.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/voice-data-flow.md`.
- Implementation follows `phase9/P9-006-voice-data-flow` scope and task P9-006 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-006 — Create Voice Data Flow Document for AIM Phase 9 Voice Mode. Use branch `phase9/P9-006-voice-data-flow` and create/update `docs/phase-9/voice-data-flow.md`. Dependency: P9-003. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-006 complete. Branch: phase9/P9-006-voice-data-flow. Output: docs/phase-9/voice-data-flow.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-007 — Create Voice API Map

**Group:** Group A — Phase 9 Control & Scope

**Priority:** P0

**Branch:** `phase9/P9-007-voice-api-map`

**Dependency:** P9-006

**Output:** `docs/phase-9/voice-api-map.md`


### Description
Create Voice API Map for Phase 9 Voice Mode. This task belongs to Group A — Phase 9 Control & Scope and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice API Map with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-007.
- Use branch `phase9/P9-007-voice-api-map`.
- Produce output: `docs/phase-9/voice-api-map.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/voice-api-map.md`.
- Implementation follows `phase9/P9-007-voice-api-map` scope and task P9-007 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-007 — Create Voice API Map for AIM Phase 9 Voice Mode. Use branch `phase9/P9-007-voice-api-map` and create/update `docs/phase-9/voice-api-map.md`. Dependency: P9-006. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-007 complete. Branch: phase9/P9-007-voice-api-map. Output: docs/phase-9/voice-api-map.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-008 — Create Voice Mobile Navigation Map

**Group:** Group A — Phase 9 Control & Scope

**Priority:** P1

**Branch:** `phase9/P9-008-voice-mobile-navigation-map`

**Dependency:** P9-006

**Output:** `docs/phase-9/voice-mobile-navigation-map.md`


### Description
Create Voice Mobile Navigation Map for Phase 9 Voice Mode. This task belongs to Group A — Phase 9 Control & Scope and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Mobile Navigation Map with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-008.
- Use branch `phase9/P9-008-voice-mobile-navigation-map`.
- Produce output: `docs/phase-9/voice-mobile-navigation-map.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `docs/phase-9/voice-mobile-navigation-map.md`.
- Implementation follows `phase9/P9-008-voice-mobile-navigation-map` scope and task P9-008 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-008 — Create Voice Mobile Navigation Map for AIM Phase 9 Voice Mode. Use branch `phase9/P9-008-voice-mobile-navigation-map` and create/update `docs/phase-9/voice-mobile-navigation-map.md`. Dependency: P9-006. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-008 complete. Branch: phase9/P9-008-voice-mobile-navigation-map. Output: docs/phase-9/voice-mobile-navigation-map.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-009 — Create Backend Voice Feature Skeleton

**Group:** Group B — Voice Architecture & Contracts

**Priority:** P0

**Branch:** `phase9/P9-009-voice-backend-feature-skeleton`

**Dependency:** P9-007

**Output:** `Backend voice-teacher feature/module`


### Description
Create Backend Voice Feature Skeleton for Phase 9 Voice Mode. This task belongs to Group B — Voice Architecture & Contracts and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Backend Voice Feature Skeleton with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-009.
- Use branch `phase9/P9-009-voice-backend-feature-skeleton`.
- Produce output: `Backend voice-teacher feature/module`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Backend voice-teacher feature/module`.
- Implementation follows `phase9/P9-009-voice-backend-feature-skeleton` scope and task P9-009 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-009 — Create Backend Voice Feature Skeleton for AIM Phase 9 Voice Mode. Use branch `phase9/P9-009-voice-backend-feature-skeleton` and create/update `Backend voice-teacher feature/module`. Dependency: P9-007. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-009 complete. Branch: phase9/P9-009-voice-backend-feature-skeleton. Output: Backend voice-teacher feature/module. Checks/tests run: <list>. Notes: <summary>.


## #P9-010 — Create Voice Mode Architecture Document

**Group:** Group B — Voice Architecture & Contracts

**Priority:** P0

**Branch:** `phase9/P9-010-voice-architecture-doc`

**Dependency:** P9-009

**Output:** `docs/phase-9/voice-architecture.md`


### Description
Create Voice Mode Architecture Document for Phase 9 Voice Mode. This task belongs to Group B — Voice Architecture & Contracts and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Mode Architecture Document with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-010.
- Use branch `phase9/P9-010-voice-architecture-doc`.
- Produce output: `docs/phase-9/voice-architecture.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/voice-architecture.md`.
- Implementation follows `phase9/P9-010-voice-architecture-doc` scope and task P9-010 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-010 — Create Voice Mode Architecture Document for AIM Phase 9 Voice Mode. Use branch `phase9/P9-010-voice-architecture-doc` and create/update `docs/phase-9/voice-architecture.md`. Dependency: P9-009. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-010 complete. Branch: phase9/P9-010-voice-architecture-doc. Output: docs/phase-9/voice-architecture.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-011 — Document Voice Request Lifecycle

**Group:** Group B — Voice Architecture & Contracts

**Priority:** P0

**Branch:** `phase9/P9-011-voice-request-lifecycle`

**Dependency:** P9-010

**Output:** `docs/phase-9/voice-request-lifecycle.md`


### Description
Document Voice Request Lifecycle for Phase 9 Voice Mode. This task belongs to Group B — Voice Architecture & Contracts and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Document Voice Request Lifecycle with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-011.
- Use branch `phase9/P9-011-voice-request-lifecycle`.
- Produce output: `docs/phase-9/voice-request-lifecycle.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/voice-request-lifecycle.md`.
- Implementation follows `phase9/P9-011-voice-request-lifecycle` scope and task P9-011 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-011 — Document Voice Request Lifecycle for AIM Phase 9 Voice Mode. Use branch `phase9/P9-011-voice-request-lifecycle` and create/update `docs/phase-9/voice-request-lifecycle.md`. Dependency: P9-010. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-011 complete. Branch: phase9/P9-011-voice-request-lifecycle. Output: docs/phase-9/voice-request-lifecycle.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-012 — Define Voice Session Contract

**Group:** Group B — Voice Architecture & Contracts

**Priority:** P0

**Branch:** `phase9/P9-012-voice-session-contract`

**Dependency:** P9-010

**Output:** `docs/phase-9/voice-session-contract.md`


### Description
Define Voice Session Contract for Phase 9 Voice Mode. This task belongs to Group B — Voice Architecture & Contracts and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Define Voice Session Contract with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-012.
- Use branch `phase9/P9-012-voice-session-contract`.
- Produce output: `docs/phase-9/voice-session-contract.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/voice-session-contract.md`.
- Implementation follows `phase9/P9-012-voice-session-contract` scope and task P9-012 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-012 — Define Voice Session Contract for AIM Phase 9 Voice Mode. Use branch `phase9/P9-012-voice-session-contract` and create/update `docs/phase-9/voice-session-contract.md`. Dependency: P9-010. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-012 complete. Branch: phase9/P9-012-voice-session-contract. Output: docs/phase-9/voice-session-contract.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-013 — Define Audio Upload Contract

**Group:** Group B — Voice Architecture & Contracts

**Priority:** P0

**Branch:** `phase9/P9-013-audio-upload-contract`

**Dependency:** P9-010

**Output:** `docs/phase-9/audio-upload-contract.md`


### Description
Define Audio Upload Contract for Phase 9 Voice Mode. This task belongs to Group B — Voice Architecture & Contracts and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Define Audio Upload Contract with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-013.
- Use branch `phase9/P9-013-audio-upload-contract`.
- Produce output: `docs/phase-9/audio-upload-contract.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/audio-upload-contract.md`.
- Implementation follows `phase9/P9-013-audio-upload-contract` scope and task P9-013 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-013 — Define Audio Upload Contract for AIM Phase 9 Voice Mode. Use branch `phase9/P9-013-audio-upload-contract` and create/update `docs/phase-9/audio-upload-contract.md`. Dependency: P9-010. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-013 complete. Branch: phase9/P9-013-audio-upload-contract. Output: docs/phase-9/audio-upload-contract.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-014 — Define Speech-to-Text Output Contract

**Group:** Group B — Voice Architecture & Contracts

**Priority:** P0

**Branch:** `phase9/P9-014-stt-output-contract`

**Dependency:** P9-010

**Output:** `docs/phase-9/stt-output-contract.md`


### Description
Define Speech-to-Text Output Contract for Phase 9 Voice Mode. This task belongs to Group B — Voice Architecture & Contracts and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Define Speech-to-Text Output Contract with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-014.
- Use branch `phase9/P9-014-stt-output-contract`.
- Produce output: `docs/phase-9/stt-output-contract.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/stt-output-contract.md`.
- Implementation follows `phase9/P9-014-stt-output-contract` scope and task P9-014 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-014 — Define Speech-to-Text Output Contract for AIM Phase 9 Voice Mode. Use branch `phase9/P9-014-stt-output-contract` and create/update `docs/phase-9/stt-output-contract.md`. Dependency: P9-010. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-014 complete. Branch: phase9/P9-014-stt-output-contract. Output: docs/phase-9/stt-output-contract.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-015 — Define Text-to-Speech Output Contract

**Group:** Group B — Voice Architecture & Contracts

**Priority:** P0

**Branch:** `phase9/P9-015-tts-output-contract`

**Dependency:** P9-010

**Output:** `docs/phase-9/tts-output-contract.md`


### Description
Define Text-to-Speech Output Contract for Phase 9 Voice Mode. This task belongs to Group B — Voice Architecture & Contracts and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Define Text-to-Speech Output Contract with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-015.
- Use branch `phase9/P9-015-tts-output-contract`.
- Produce output: `docs/phase-9/tts-output-contract.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/tts-output-contract.md`.
- Implementation follows `phase9/P9-015-tts-output-contract` scope and task P9-015 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-015 — Define Text-to-Speech Output Contract for AIM Phase 9 Voice Mode. Use branch `phase9/P9-015-tts-output-contract` and create/update `docs/phase-9/tts-output-contract.md`. Dependency: P9-010. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-015 complete. Branch: phase9/P9-015-tts-output-contract. Output: docs/phase-9/tts-output-contract.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-016 — Define Voice Error Policy

**Group:** Group B — Voice Architecture & Contracts

**Priority:** P0

**Branch:** `phase9/P9-016-voice-error-policy`

**Dependency:** P9-010

**Output:** `docs/phase-9/voice-error-policy.md`


### Description
Define Voice Error Policy for Phase 9 Voice Mode. This task belongs to Group B — Voice Architecture & Contracts and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Define Voice Error Policy with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-016.
- Use branch `phase9/P9-016-voice-error-policy`.
- Produce output: `docs/phase-9/voice-error-policy.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/voice-error-policy.md`.
- Implementation follows `phase9/P9-016-voice-error-policy` scope and task P9-016 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-016 — Define Voice Error Policy for AIM Phase 9 Voice Mode. Use branch `phase9/P9-016-voice-error-policy` and create/update `docs/phase-9/voice-error-policy.md`. Dependency: P9-010. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-016 complete. Branch: phase9/P9-016-voice-error-policy. Output: docs/phase-9/voice-error-policy.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-017 — Define Voice Privacy Policy

**Group:** Group B — Voice Architecture & Contracts

**Priority:** P0

**Branch:** `phase9/P9-017-voice-privacy-policy`

**Dependency:** P9-010

**Output:** `docs/phase-9/voice-privacy-policy.md`


### Description
Define Voice Privacy Policy for Phase 9 Voice Mode. This task belongs to Group B — Voice Architecture & Contracts and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Define Voice Privacy Policy with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-017.
- Use branch `phase9/P9-017-voice-privacy-policy`.
- Produce output: `docs/phase-9/voice-privacy-policy.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/voice-privacy-policy.md`.
- Implementation follows `phase9/P9-017-voice-privacy-policy` scope and task P9-017 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-017 — Define Voice Privacy Policy for AIM Phase 9 Voice Mode. Use branch `phase9/P9-017-voice-privacy-policy` and create/update `docs/phase-9/voice-privacy-policy.md`. Dependency: P9-010. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-017 complete. Branch: phase9/P9-017-voice-privacy-policy. Output: docs/phase-9/voice-privacy-policy.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-018 — Create Voice Sessions Table

**Group:** Group C — Voice Database & Persistence

**Priority:** P0

**Branch:** `phase9/P9-018-voice-sessions-migration`

**Dependency:** P9-012

**Output:** `DB migration for voice_sessions`


### Description
Create Voice Sessions Table for Phase 9 Voice Mode. This task belongs to Group C — Voice Database & Persistence and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Sessions Table with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-018.
- Use branch `phase9/P9-018-voice-sessions-migration`.
- Produce output: `DB migration for voice_sessions`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `DB migration for voice_sessions`.
- Implementation follows `phase9/P9-018-voice-sessions-migration` scope and task P9-018 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-018 — Create Voice Sessions Table for AIM Phase 9 Voice Mode. Use branch `phase9/P9-018-voice-sessions-migration` and create/update `DB migration for voice_sessions`. Dependency: P9-012. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-018 complete. Branch: phase9/P9-018-voice-sessions-migration. Output: DB migration for voice_sessions. Checks/tests run: <list>. Notes: <summary>.


## #P9-019 — Create Voice Messages Table

**Group:** Group C — Voice Database & Persistence

**Priority:** P0

**Branch:** `phase9/P9-019-voice-messages-migration`

**Dependency:** P9-018

**Output:** `DB migration for voice_messages`


### Description
Create Voice Messages Table for Phase 9 Voice Mode. This task belongs to Group C — Voice Database & Persistence and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Messages Table with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-019.
- Use branch `phase9/P9-019-voice-messages-migration`.
- Produce output: `DB migration for voice_messages`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `DB migration for voice_messages`.
- Implementation follows `phase9/P9-019-voice-messages-migration` scope and task P9-019 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-019 — Create Voice Messages Table for AIM Phase 9 Voice Mode. Use branch `phase9/P9-019-voice-messages-migration` and create/update `DB migration for voice_messages`. Dependency: P9-018. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-019 complete. Branch: phase9/P9-019-voice-messages-migration. Output: DB migration for voice_messages. Checks/tests run: <list>. Notes: <summary>.


## #P9-020 — Create Voice Audio Assets Table

**Group:** Group C — Voice Database & Persistence

**Priority:** P0

**Branch:** `phase9/P9-020-voice-audio-assets-migration`

**Dependency:** P9-019

**Output:** `DB migration for voice_audio_assets`


### Description
Create Voice Audio Assets Table for Phase 9 Voice Mode. This task belongs to Group C — Voice Database & Persistence and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Audio Assets Table with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-020.
- Use branch `phase9/P9-020-voice-audio-assets-migration`.
- Produce output: `DB migration for voice_audio_assets`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `DB migration for voice_audio_assets`.
- Implementation follows `phase9/P9-020-voice-audio-assets-migration` scope and task P9-020 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-020 — Create Voice Audio Assets Table for AIM Phase 9 Voice Mode. Use branch `phase9/P9-020-voice-audio-assets-migration` and create/update `DB migration for voice_audio_assets`. Dependency: P9-019. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-020 complete. Branch: phase9/P9-020-voice-audio-assets-migration. Output: DB migration for voice_audio_assets. Checks/tests run: <list>. Notes: <summary>.


## #P9-021 — Create Voice Transcripts Table

**Group:** Group C — Voice Database & Persistence

**Priority:** P0

**Branch:** `phase9/P9-021-voice-transcripts-migration`

**Dependency:** P9-019

**Output:** `DB migration for voice_transcripts`


### Description
Create Voice Transcripts Table for Phase 9 Voice Mode. This task belongs to Group C — Voice Database & Persistence and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Transcripts Table with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-021.
- Use branch `phase9/P9-021-voice-transcripts-migration`.
- Produce output: `DB migration for voice_transcripts`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `DB migration for voice_transcripts`.
- Implementation follows `phase9/P9-021-voice-transcripts-migration` scope and task P9-021 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-021 — Create Voice Transcripts Table for AIM Phase 9 Voice Mode. Use branch `phase9/P9-021-voice-transcripts-migration` and create/update `DB migration for voice_transcripts`. Dependency: P9-019. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-021 complete. Branch: phase9/P9-021-voice-transcripts-migration. Output: DB migration for voice_transcripts. Checks/tests run: <list>. Notes: <summary>.


## #P9-022 — Create Voice Provider Logs Table

**Group:** Group C — Voice Database & Persistence

**Priority:** P1

**Branch:** `phase9/P9-022-voice-provider-logs-migration`

**Dependency:** P9-019

**Output:** `DB migration for voice provider logs`


### Description
Create Voice Provider Logs Table for Phase 9 Voice Mode. This task belongs to Group C — Voice Database & Persistence and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Provider Logs Table with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-022.
- Use branch `phase9/P9-022-voice-provider-logs-migration`.
- Produce output: `DB migration for voice provider logs`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `DB migration for voice provider logs`.
- Implementation follows `phase9/P9-022-voice-provider-logs-migration` scope and task P9-022 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-022 — Create Voice Provider Logs Table for AIM Phase 9 Voice Mode. Use branch `phase9/P9-022-voice-provider-logs-migration` and create/update `DB migration for voice provider logs`. Dependency: P9-019. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-022 complete. Branch: phase9/P9-022-voice-provider-logs-migration. Output: DB migration for voice provider logs. Checks/tests run: <list>. Notes: <summary>.


## #P9-023 — Create Voice Safety Events Table

**Group:** Group C — Voice Database & Persistence

**Priority:** P1

**Branch:** `phase9/P9-023-voice-safety-events-migration`

**Dependency:** P9-019

**Output:** `DB migration for voice safety events`


### Description
Create Voice Safety Events Table for Phase 9 Voice Mode. This task belongs to Group C — Voice Database & Persistence and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Safety Events Table with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-023.
- Use branch `phase9/P9-023-voice-safety-events-migration`.
- Produce output: `DB migration for voice safety events`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `DB migration for voice safety events`.
- Implementation follows `phase9/P9-023-voice-safety-events-migration` scope and task P9-023 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-023 — Create Voice Safety Events Table for AIM Phase 9 Voice Mode. Use branch `phase9/P9-023-voice-safety-events-migration` and create/update `DB migration for voice safety events`. Dependency: P9-019. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-023 complete. Branch: phase9/P9-023-voice-safety-events-migration. Output: DB migration for voice safety events. Checks/tests run: <list>. Notes: <summary>.


## #P9-024 — Create Voice Feedback Table

**Group:** Group C — Voice Database & Persistence

**Priority:** P1

**Branch:** `phase9/P9-024-voice-feedback-migration`

**Dependency:** P9-019

**Output:** `DB migration for voice response feedback`


### Description
Create Voice Feedback Table for Phase 9 Voice Mode. This task belongs to Group C — Voice Database & Persistence and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Feedback Table with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-024.
- Use branch `phase9/P9-024-voice-feedback-migration`.
- Produce output: `DB migration for voice response feedback`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `DB migration for voice response feedback`.
- Implementation follows `phase9/P9-024-voice-feedback-migration` scope and task P9-024 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-024 — Create Voice Feedback Table for AIM Phase 9 Voice Mode. Use branch `phase9/P9-024-voice-feedback-migration` and create/update `DB migration for voice response feedback`. Dependency: P9-019. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-024 complete. Branch: phase9/P9-024-voice-feedback-migration. Output: DB migration for voice response feedback. Checks/tests run: <list>. Notes: <summary>.


## #P9-025 — Add Voice Table Indexes

**Group:** Group C — Voice Database & Persistence

**Priority:** P1

**Branch:** `phase9/P9-025-voice-indexes`

**Dependency:** P9-018..P9-024

**Output:** `DB indexes for voice reads/writes`


### Description
Add Voice Table Indexes for Phase 9 Voice Mode. This task belongs to Group C — Voice Database & Persistence and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Voice Table Indexes with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-025.
- Use branch `phase9/P9-025-voice-indexes`.
- Produce output: `DB indexes for voice reads/writes`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `DB indexes for voice reads/writes`.
- Implementation follows `phase9/P9-025-voice-indexes` scope and task P9-025 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-025 — Add Voice Table Indexes for AIM Phase 9 Voice Mode. Use branch `phase9/P9-025-voice-indexes` and create/update `DB indexes for voice reads/writes`. Dependency: P9-018..P9-024. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-025 complete. Branch: phase9/P9-025-voice-indexes. Output: DB indexes for voice reads/writes. Checks/tests run: <list>. Notes: <summary>.


## #P9-026 — Review Voice RLS/Permission Rules

**Group:** Group C — Voice Database & Persistence

**Priority:** P0

**Branch:** `phase9/P9-026-voice-rls-permission-review`

**Dependency:** P9-018..P9-024

**Output:** `docs/quality/phase-9-voice-rls-review.md`


### Description
Review Voice RLS/Permission Rules for Phase 9 Voice Mode. This task belongs to Group C — Voice Database & Persistence and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Review Voice RLS/Permission Rules with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-026.
- Use branch `phase9/P9-026-voice-rls-permission-review`.
- Produce output: `docs/quality/phase-9-voice-rls-review.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/quality/phase-9-voice-rls-review.md`.
- Implementation follows `phase9/P9-026-voice-rls-permission-review` scope and task P9-026 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-026 — Review Voice RLS/Permission Rules for AIM Phase 9 Voice Mode. Use branch `phase9/P9-026-voice-rls-permission-review` and create/update `docs/quality/phase-9-voice-rls-review.md`. Dependency: P9-018..P9-024. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-026 complete. Branch: phase9/P9-026-voice-rls-permission-review. Output: docs/quality/phase-9-voice-rls-review.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-027 — Add Voice Backend Repositories

**Group:** Group C — Voice Database & Persistence

**Priority:** P0

**Branch:** `phase9/P9-027-voice-repositories`

**Dependency:** P9-018..P9-024

**Output:** `Backend voice persistence repositories`


### Description
Add Voice Backend Repositories for Phase 9 Voice Mode. This task belongs to Group C — Voice Database & Persistence and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Voice Backend Repositories with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-027.
- Use branch `phase9/P9-027-voice-repositories`.
- Produce output: `Backend voice persistence repositories`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Backend voice persistence repositories`.
- Implementation follows `phase9/P9-027-voice-repositories` scope and task P9-027 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-027 — Add Voice Backend Repositories for AIM Phase 9 Voice Mode. Use branch `phase9/P9-027-voice-repositories` and create/update `Backend voice persistence repositories`. Dependency: P9-018..P9-024. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-027 complete. Branch: phase9/P9-027-voice-repositories. Output: Backend voice persistence repositories. Checks/tests run: <list>. Notes: <summary>.


## #P9-028 — Build Audio Upload Service

**Group:** Group D — Backend Audio Upload & Validation

**Priority:** P0

**Branch:** `phase9/P9-028-audio-upload-service`

**Dependency:** P9-013, P9-027

**Output:** `Backend audio upload service`


### Description
Build Audio Upload Service for Phase 9 Voice Mode. This task belongs to Group D — Backend Audio Upload & Validation and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build Audio Upload Service with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-028.
- Use branch `phase9/P9-028-audio-upload-service`.
- Produce output: `Backend audio upload service`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Backend audio upload service`.
- Implementation follows `phase9/P9-028-audio-upload-service` scope and task P9-028 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-028 — Build Audio Upload Service for AIM Phase 9 Voice Mode. Use branch `phase9/P9-028-audio-upload-service` and create/update `Backend audio upload service`. Dependency: P9-013, P9-027. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-028 complete. Branch: phase9/P9-028-audio-upload-service. Output: Backend audio upload service. Checks/tests run: <list>. Notes: <summary>.


## #P9-029 — Add Audio File Validation

**Group:** Group D — Backend Audio Upload & Validation

**Priority:** P0

**Branch:** `phase9/P9-029-audio-file-validation`

**Dependency:** P9-028

**Output:** `File type/size/duration validation`


### Description
Add Audio File Validation for Phase 9 Voice Mode. This task belongs to Group D — Backend Audio Upload & Validation and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Audio File Validation with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-029.
- Use branch `phase9/P9-029-audio-file-validation`.
- Produce output: `File type/size/duration validation`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `File type/size/duration validation`.
- Implementation follows `phase9/P9-029-audio-file-validation` scope and task P9-029 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-029 — Add Audio File Validation for AIM Phase 9 Voice Mode. Use branch `phase9/P9-029-audio-file-validation` and create/update `File type/size/duration validation`. Dependency: P9-028. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-029 complete. Branch: phase9/P9-029-audio-file-validation. Output: File type/size/duration validation. Checks/tests run: <list>. Notes: <summary>.


## #P9-030 — Add Audio Duration Policy

**Group:** Group D — Backend Audio Upload & Validation

**Priority:** P1

**Branch:** `phase9/P9-030-audio-duration-policy`

**Dependency:** P9-029

**Output:** `Max/min voice message duration rules`


### Description
Add Audio Duration Policy for Phase 9 Voice Mode. This task belongs to Group D — Backend Audio Upload & Validation and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Audio Duration Policy with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-030.
- Use branch `phase9/P9-030-audio-duration-policy`.
- Produce output: `Max/min voice message duration rules`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Max/min voice message duration rules`.
- Implementation follows `phase9/P9-030-audio-duration-policy` scope and task P9-030 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-030 — Add Audio Duration Policy for AIM Phase 9 Voice Mode. Use branch `phase9/P9-030-audio-duration-policy` and create/update `Max/min voice message duration rules`. Dependency: P9-029. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-030 complete. Branch: phase9/P9-030-audio-duration-policy. Output: Max/min voice message duration rules. Checks/tests run: <list>. Notes: <summary>.


## #P9-031 — Add Audio Storage Adapter

**Group:** Group D — Backend Audio Upload & Validation

**Priority:** P0

**Branch:** `phase9/P9-031-audio-storage-adapter`

**Dependency:** P9-020, P9-028

**Output:** `Backend audio storage abstraction`


### Description
Add Audio Storage Adapter for Phase 9 Voice Mode. This task belongs to Group D — Backend Audio Upload & Validation and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Audio Storage Adapter with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-031.
- Use branch `phase9/P9-031-audio-storage-adapter`.
- Produce output: `Backend audio storage abstraction`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Backend audio storage abstraction`.
- Implementation follows `phase9/P9-031-audio-storage-adapter` scope and task P9-031 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-031 — Add Audio Storage Adapter for AIM Phase 9 Voice Mode. Use branch `phase9/P9-031-audio-storage-adapter` and create/update `Backend audio storage abstraction`. Dependency: P9-020, P9-028. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-031 complete. Branch: phase9/P9-031-audio-storage-adapter. Output: Backend audio storage abstraction. Checks/tests run: <list>. Notes: <summary>.


## #P9-032 — Persist Audio Metadata

**Group:** Group D — Backend Audio Upload & Validation

**Priority:** P0

**Branch:** `phase9/P9-032-audio-metadata-persistence`

**Dependency:** P9-020, P9-031

**Output:** `Stored audio metadata records`


### Description
Persist Audio Metadata for Phase 9 Voice Mode. This task belongs to Group D — Backend Audio Upload & Validation and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Persist Audio Metadata with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-032.
- Use branch `phase9/P9-032-audio-metadata-persistence`.
- Produce output: `Stored audio metadata records`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Stored audio metadata records`.
- Implementation follows `phase9/P9-032-audio-metadata-persistence` scope and task P9-032 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-032 — Persist Audio Metadata for AIM Phase 9 Voice Mode. Use branch `phase9/P9-032-audio-metadata-persistence` and create/update `Stored audio metadata records`. Dependency: P9-020, P9-031. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-032 complete. Branch: phase9/P9-032-audio-metadata-persistence. Output: Stored audio metadata records. Checks/tests run: <list>. Notes: <summary>.


## #P9-033 — Add Audio Cleanup Policy

**Group:** Group D — Backend Audio Upload & Validation

**Priority:** P1

**Branch:** `phase9/P9-033-audio-cleanup-policy`

**Dependency:** P9-017, P9-032

**Output:** `Audio retention/cleanup policy`


### Description
Add Audio Cleanup Policy for Phase 9 Voice Mode. This task belongs to Group D — Backend Audio Upload & Validation and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Audio Cleanup Policy with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-033.
- Use branch `phase9/P9-033-audio-cleanup-policy`.
- Produce output: `Audio retention/cleanup policy`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Audio retention/cleanup policy`.
- Implementation follows `phase9/P9-033-audio-cleanup-policy` scope and task P9-033 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-033 — Add Audio Cleanup Policy for AIM Phase 9 Voice Mode. Use branch `phase9/P9-033-audio-cleanup-policy` and create/update `Audio retention/cleanup policy`. Dependency: P9-017, P9-032. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-033 complete. Branch: phase9/P9-033-audio-cleanup-policy. Output: Audio retention/cleanup policy. Checks/tests run: <list>. Notes: <summary>.


## #P9-034 — Add Audio Upload Safe Failure Handling

**Group:** Group D — Backend Audio Upload & Validation

**Priority:** P1

**Branch:** `phase9/P9-034-audio-safe-failure`

**Dependency:** P9-016, P9-028

**Output:** `Safe upload failure behavior`


### Description
Add Audio Upload Safe Failure Handling for Phase 9 Voice Mode. This task belongs to Group D — Backend Audio Upload & Validation and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Audio Upload Safe Failure Handling with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-034.
- Use branch `phase9/P9-034-audio-safe-failure`.
- Produce output: `Safe upload failure behavior`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Safe upload failure behavior`.
- Implementation follows `phase9/P9-034-audio-safe-failure` scope and task P9-034 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-034 — Add Audio Upload Safe Failure Handling for AIM Phase 9 Voice Mode. Use branch `phase9/P9-034-audio-safe-failure` and create/update `Safe upload failure behavior`. Dependency: P9-016, P9-028. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-034 complete. Branch: phase9/P9-034-audio-safe-failure. Output: Safe upload failure behavior. Checks/tests run: <list>. Notes: <summary>.


## #P9-035 — Add Audio Upload Tests

**Group:** Group D — Backend Audio Upload & Validation

**Priority:** P1

**Branch:** `phase9/P9-035-audio-upload-tests`

**Dependency:** P9-028..P9-034

**Output:** `Backend upload tests`


### Description
Add Audio Upload Tests for Phase 9 Voice Mode. This task belongs to Group D — Backend Audio Upload & Validation and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Audio Upload Tests with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-035.
- Use branch `phase9/P9-035-audio-upload-tests`.
- Produce output: `Backend upload tests`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Backend upload tests`.
- Implementation follows `phase9/P9-035-audio-upload-tests` scope and task P9-035 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-035 — Add Audio Upload Tests for AIM Phase 9 Voice Mode. Use branch `phase9/P9-035-audio-upload-tests` and create/update `Backend upload tests`. Dependency: P9-028..P9-034. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-035 complete. Branch: phase9/P9-035-audio-upload-tests. Output: Backend upload tests. Checks/tests run: <list>. Notes: <summary>.


## #P9-036 — Run Audio Upload Security Review

**Group:** Group D — Backend Audio Upload & Validation

**Priority:** P0

**Branch:** `phase9/P9-036-audio-security-review`

**Dependency:** P9-035

**Output:** `docs/quality/phase-9-audio-upload-security-review.md`


### Description
Run Audio Upload Security Review for Phase 9 Voice Mode. This task belongs to Group D — Backend Audio Upload & Validation and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Run Audio Upload Security Review with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-036.
- Use branch `phase9/P9-036-audio-security-review`.
- Produce output: `docs/quality/phase-9-audio-upload-security-review.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/quality/phase-9-audio-upload-security-review.md`.
- Implementation follows `phase9/P9-036-audio-security-review` scope and task P9-036 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-036 — Run Audio Upload Security Review for AIM Phase 9 Voice Mode. Use branch `phase9/P9-036-audio-security-review` and create/update `docs/quality/phase-9-audio-upload-security-review.md`. Dependency: P9-035. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-036 complete. Branch: phase9/P9-036-audio-security-review. Output: docs/quality/phase-9-audio-upload-security-review.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-037 — Run Audio Upload Privacy Review

**Group:** Group D — Backend Audio Upload & Validation

**Priority:** P0

**Branch:** `phase9/P9-037-audio-privacy-review`

**Dependency:** P9-035

**Output:** `docs/quality/phase-9-audio-upload-privacy-review.md`


### Description
Run Audio Upload Privacy Review for Phase 9 Voice Mode. This task belongs to Group D — Backend Audio Upload & Validation and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Run Audio Upload Privacy Review with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-037.
- Use branch `phase9/P9-037-audio-privacy-review`.
- Produce output: `docs/quality/phase-9-audio-upload-privacy-review.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/quality/phase-9-audio-upload-privacy-review.md`.
- Implementation follows `phase9/P9-037-audio-privacy-review` scope and task P9-037 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-037 — Run Audio Upload Privacy Review for AIM Phase 9 Voice Mode. Use branch `phase9/P9-037-audio-privacy-review` and create/update `docs/quality/phase-9-audio-upload-privacy-review.md`. Dependency: P9-035. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-037 complete. Branch: phase9/P9-037-audio-privacy-review. Output: docs/quality/phase-9-audio-upload-privacy-review.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-038 — Create STT Provider Interface

**Group:** Group E — Speech-to-Text Pipeline

**Priority:** P0

**Branch:** `phase9/P9-038-stt-provider-interface`

**Dependency:** P9-014

**Output:** `Backend STT abstraction`


### Description
Create STT Provider Interface for Phase 9 Voice Mode. This task belongs to Group E — Speech-to-Text Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create STT Provider Interface with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-038.
- Use branch `phase9/P9-038-stt-provider-interface`.
- Produce output: `Backend STT abstraction`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Backend STT abstraction`.
- Implementation follows `phase9/P9-038-stt-provider-interface` scope and task P9-038 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-038 — Create STT Provider Interface for AIM Phase 9 Voice Mode. Use branch `phase9/P9-038-stt-provider-interface` and create/update `Backend STT abstraction`. Dependency: P9-014. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-038 complete. Branch: phase9/P9-038-stt-provider-interface. Output: Backend STT abstraction. Checks/tests run: <list>. Notes: <summary>.


## #P9-039 — Add STT Provider Config

**Group:** Group E — Speech-to-Text Pipeline

**Priority:** P0

**Branch:** `phase9/P9-039-stt-provider-config`

**Dependency:** P9-038

**Output:** `STT config without committed secrets`


### Description
Add STT Provider Config for Phase 9 Voice Mode. This task belongs to Group E — Speech-to-Text Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add STT Provider Config with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-039.
- Use branch `phase9/P9-039-stt-provider-config`.
- Produce output: `STT config without committed secrets`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `STT config without committed secrets`.
- Implementation follows `phase9/P9-039-stt-provider-config` scope and task P9-039 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-039 — Add STT Provider Config for AIM Phase 9 Voice Mode. Use branch `phase9/P9-039-stt-provider-config` and create/update `STT config without committed secrets`. Dependency: P9-038. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-039 complete. Branch: phase9/P9-039-stt-provider-config. Output: STT config without committed secrets. Checks/tests run: <list>. Notes: <summary>.


## #P9-040 — Create STT Request Mapper

**Group:** Group E — Speech-to-Text Pipeline

**Priority:** P1

**Branch:** `phase9/P9-040-stt-request-mapper`

**Dependency:** P9-038

**Output:** `Audio-to-STT request mapping`


### Description
Create STT Request Mapper for Phase 9 Voice Mode. This task belongs to Group E — Speech-to-Text Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create STT Request Mapper with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-040.
- Use branch `phase9/P9-040-stt-request-mapper`.
- Produce output: `Audio-to-STT request mapping`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Audio-to-STT request mapping`.
- Implementation follows `phase9/P9-040-stt-request-mapper` scope and task P9-040 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-040 — Create STT Request Mapper for AIM Phase 9 Voice Mode. Use branch `phase9/P9-040-stt-request-mapper` and create/update `Audio-to-STT request mapping`. Dependency: P9-038. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-040 complete. Branch: phase9/P9-040-stt-request-mapper. Output: Audio-to-STT request mapping. Checks/tests run: <list>. Notes: <summary>.


## #P9-041 — Create STT Response Mapper

**Group:** Group E — Speech-to-Text Pipeline

**Priority:** P1

**Branch:** `phase9/P9-041-stt-response-mapper`

**Dependency:** P9-038

**Output:** `STT response normalization`


### Description
Create STT Response Mapper for Phase 9 Voice Mode. This task belongs to Group E — Speech-to-Text Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create STT Response Mapper with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-041.
- Use branch `phase9/P9-041-stt-response-mapper`.
- Produce output: `STT response normalization`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `STT response normalization`.
- Implementation follows `phase9/P9-041-stt-response-mapper` scope and task P9-041 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-041 — Create STT Response Mapper for AIM Phase 9 Voice Mode. Use branch `phase9/P9-041-stt-response-mapper` and create/update `STT response normalization`. Dependency: P9-038. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-041 complete. Branch: phase9/P9-041-stt-response-mapper. Output: STT response normalization. Checks/tests run: <list>. Notes: <summary>.


## #P9-042 — Add STT Language Policy

**Group:** Group E — Speech-to-Text Pipeline

**Priority:** P0

**Branch:** `phase9/P9-042-stt-language-policy`

**Dependency:** P9-038

**Output:** `English/Arabic language handling rules`


### Description
Add STT Language Policy for Phase 9 Voice Mode. This task belongs to Group E — Speech-to-Text Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add STT Language Policy with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-042.
- Use branch `phase9/P9-042-stt-language-policy`.
- Produce output: `English/Arabic language handling rules`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `English/Arabic language handling rules`.
- Implementation follows `phase9/P9-042-stt-language-policy` scope and task P9-042 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-042 — Add STT Language Policy for AIM Phase 9 Voice Mode. Use branch `phase9/P9-042-stt-language-policy` and create/update `English/Arabic language handling rules`. Dependency: P9-038. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-042 complete. Branch: phase9/P9-042-stt-language-policy. Output: English/Arabic language handling rules. Checks/tests run: <list>. Notes: <summary>.


## #P9-043 — Add STT Confidence Policy

**Group:** Group E — Speech-to-Text Pipeline

**Priority:** P1

**Branch:** `phase9/P9-043-stt-confidence-policy`

**Dependency:** P9-041

**Output:** `Low-confidence transcript handling`


### Description
Add STT Confidence Policy for Phase 9 Voice Mode. This task belongs to Group E — Speech-to-Text Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add STT Confidence Policy with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-043.
- Use branch `phase9/P9-043-stt-confidence-policy`.
- Produce output: `Low-confidence transcript handling`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Low-confidence transcript handling`.
- Implementation follows `phase9/P9-043-stt-confidence-policy` scope and task P9-043 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-043 — Add STT Confidence Policy for AIM Phase 9 Voice Mode. Use branch `phase9/P9-043-stt-confidence-policy` and create/update `Low-confidence transcript handling`. Dependency: P9-041. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-043 complete. Branch: phase9/P9-043-stt-confidence-policy. Output: Low-confidence transcript handling. Checks/tests run: <list>. Notes: <summary>.


## #P9-044 — Persist STT Transcript

**Group:** Group E — Speech-to-Text Pipeline

**Priority:** P0

**Branch:** `phase9/P9-044-stt-transcript-persistence`

**Dependency:** P9-021, P9-041

**Output:** `Store transcript safely`


### Description
Persist STT Transcript for Phase 9 Voice Mode. This task belongs to Group E — Speech-to-Text Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Persist STT Transcript with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-044.
- Use branch `phase9/P9-044-stt-transcript-persistence`.
- Produce output: `Store transcript safely`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Store transcript safely`.
- Implementation follows `phase9/P9-044-stt-transcript-persistence` scope and task P9-044 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-044 — Persist STT Transcript for AIM Phase 9 Voice Mode. Use branch `phase9/P9-044-stt-transcript-persistence` and create/update `Store transcript safely`. Dependency: P9-021, P9-041. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-044 complete. Branch: phase9/P9-044-stt-transcript-persistence. Output: Store transcript safely. Checks/tests run: <list>. Notes: <summary>.


## #P9-045 — Add STT Safe Failure Handling

**Group:** Group E — Speech-to-Text Pipeline

**Priority:** P1

**Branch:** `phase9/P9-045-stt-safe-failure`

**Dependency:** P9-016, P9-041

**Output:** `Safe fallback on failed transcription`


### Description
Add STT Safe Failure Handling for Phase 9 Voice Mode. This task belongs to Group E — Speech-to-Text Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add STT Safe Failure Handling with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-045.
- Use branch `phase9/P9-045-stt-safe-failure`.
- Produce output: `Safe fallback on failed transcription`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Safe fallback on failed transcription`.
- Implementation follows `phase9/P9-045-stt-safe-failure` scope and task P9-045 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-045 — Add STT Safe Failure Handling for AIM Phase 9 Voice Mode. Use branch `phase9/P9-045-stt-safe-failure` and create/update `Safe fallback on failed transcription`. Dependency: P9-016, P9-041. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-045 complete. Branch: phase9/P9-045-stt-safe-failure. Output: Safe fallback on failed transcription. Checks/tests run: <list>. Notes: <summary>.


## #P9-046 — Add STT Provider Tests

**Group:** Group E — Speech-to-Text Pipeline

**Priority:** P1

**Branch:** `phase9/P9-046-stt-provider-tests`

**Dependency:** P9-038..P9-045

**Output:** `Backend STT tests`


### Description
Add STT Provider Tests for Phase 9 Voice Mode. This task belongs to Group E — Speech-to-Text Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add STT Provider Tests with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-046.
- Use branch `phase9/P9-046-stt-provider-tests`.
- Produce output: `Backend STT tests`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Backend STT tests`.
- Implementation follows `phase9/P9-046-stt-provider-tests` scope and task P9-046 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-046 — Add STT Provider Tests for AIM Phase 9 Voice Mode. Use branch `phase9/P9-046-stt-provider-tests` and create/update `Backend STT tests`. Dependency: P9-038..P9-045. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-046 complete. Branch: phase9/P9-046-stt-provider-tests. Output: Backend STT tests. Checks/tests run: <list>. Notes: <summary>.


## #P9-047 — Verify STT Secrets Are Not Committed

**Group:** Group E — Speech-to-Text Pipeline

**Priority:** P0

**Branch:** `phase9/P9-047-stt-no-secret-check`

**Dependency:** P9-039

**Output:** `Secret safety check`


### Description
Verify STT Secrets Are Not Committed for Phase 9 Voice Mode. This task belongs to Group E — Speech-to-Text Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Verify STT Secrets Are Not Committed with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-047.
- Use branch `phase9/P9-047-stt-no-secret-check`.
- Produce output: `Secret safety check`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Secret safety check`.
- Implementation follows `phase9/P9-047-stt-no-secret-check` scope and task P9-047 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-047 — Verify STT Secrets Are Not Committed for AIM Phase 9 Voice Mode. Use branch `phase9/P9-047-stt-no-secret-check` and create/update `Secret safety check`. Dependency: P9-039. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-047 complete. Branch: phase9/P9-047-stt-no-secret-check. Output: Secret safety check. Checks/tests run: <list>. Notes: <summary>.


## #P9-048 — Create Voice Orchestrator Skeleton

**Group:** Group F — Voice Orchestration With Phase 8 AI Teacher

**Priority:** P0

**Branch:** `phase9/P9-048-voice-orchestrator-skeleton`

**Dependency:** P9-046, P8-062

**Output:** `Backend voice orchestrator service`


### Description
Create Voice Orchestrator Skeleton for Phase 9 Voice Mode. This task belongs to Group F — Voice Orchestration With Phase 8 AI Teacher and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Orchestrator Skeleton with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-048.
- Use branch `phase9/P9-048-voice-orchestrator-skeleton`.
- Produce output: `Backend voice orchestrator service`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Backend voice orchestrator service`.
- Implementation follows `phase9/P9-048-voice-orchestrator-skeleton` scope and task P9-048 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-048 — Create Voice Orchestrator Skeleton for AIM Phase 9 Voice Mode. Use branch `phase9/P9-048-voice-orchestrator-skeleton` and create/update `Backend voice orchestrator service`. Dependency: P9-046, P8-062. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-048 complete. Branch: phase9/P9-048-voice-orchestrator-skeleton. Output: Backend voice orchestrator service. Checks/tests run: <list>. Notes: <summary>.


## #P9-049 — Build Voice Session Start Service

**Group:** Group F — Voice Orchestration With Phase 8 AI Teacher

**Priority:** P0

**Branch:** `phase9/P9-049-voice-session-start-service`

**Dependency:** P9-018, P9-048

**Output:** `Backend voice session start flow`


### Description
Build Voice Session Start Service for Phase 9 Voice Mode. This task belongs to Group F — Voice Orchestration With Phase 8 AI Teacher and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build Voice Session Start Service with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-049.
- Use branch `phase9/P9-049-voice-session-start-service`.
- Produce output: `Backend voice session start flow`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Backend voice session start flow`.
- Implementation follows `phase9/P9-049-voice-session-start-service` scope and task P9-049 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-049 — Build Voice Session Start Service for AIM Phase 9 Voice Mode. Use branch `phase9/P9-049-voice-session-start-service` and create/update `Backend voice session start flow`. Dependency: P9-018, P9-048. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-049 complete. Branch: phase9/P9-049-voice-session-start-service. Output: Backend voice session start flow. Checks/tests run: <list>. Notes: <summary>.


## #P9-050 — Build Voice Message Submit Service

**Group:** Group F — Voice Orchestration With Phase 8 AI Teacher

**Priority:** P0

**Branch:** `phase9/P9-050-voice-message-submit-service`

**Dependency:** P9-028, P9-048

**Output:** `Backend voice message submit flow`


### Description
Build Voice Message Submit Service for Phase 9 Voice Mode. This task belongs to Group F — Voice Orchestration With Phase 8 AI Teacher and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build Voice Message Submit Service with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-050.
- Use branch `phase9/P9-050-voice-message-submit-service`.
- Produce output: `Backend voice message submit flow`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Backend voice message submit flow`.
- Implementation follows `phase9/P9-050-voice-message-submit-service` scope and task P9-050 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-050 — Build Voice Message Submit Service for AIM Phase 9 Voice Mode. Use branch `phase9/P9-050-voice-message-submit-service` and create/update `Backend voice message submit flow`. Dependency: P9-028, P9-048. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-050 complete. Branch: phase9/P9-050-voice-message-submit-service. Output: Backend voice message submit flow. Checks/tests run: <list>. Notes: <summary>.


## #P9-051 — Connect Transcript to Phase 8 AI Teacher Pipeline

**Group:** Group F — Voice Orchestration With Phase 8 AI Teacher

**Priority:** P0

**Branch:** `phase9/P9-051-transcript-to-ai-teacher-flow`

**Dependency:** P8-062, P9-044

**Output:** `STT transcript sent to AI Teacher text pipeline`


### Description
Connect Transcript to Phase 8 AI Teacher Pipeline for Phase 9 Voice Mode. This task belongs to Group F — Voice Orchestration With Phase 8 AI Teacher and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Connect Transcript to Phase 8 AI Teacher Pipeline with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-051.
- Use branch `phase9/P9-051-transcript-to-ai-teacher-flow`.
- Produce output: `STT transcript sent to AI Teacher text pipeline`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `STT transcript sent to AI Teacher text pipeline`.
- Implementation follows `phase9/P9-051-transcript-to-ai-teacher-flow` scope and task P9-051 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-051 — Connect Transcript to Phase 8 AI Teacher Pipeline for AIM Phase 9 Voice Mode. Use branch `phase9/P9-051-transcript-to-ai-teacher-flow` and create/update `STT transcript sent to AI Teacher text pipeline`. Dependency: P8-062, P9-044. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-051 complete. Branch: phase9/P9-051-transcript-to-ai-teacher-flow. Output: STT transcript sent to AI Teacher text pipeline. Checks/tests run: <list>. Notes: <summary>.


## #P9-052 — Link Voice Session With AI Teacher Context

**Group:** Group F — Voice Orchestration With Phase 8 AI Teacher

**Priority:** P0

**Branch:** `phase9/P9-052-ai-teacher-voice-context-link`

**Dependency:** P8-028..P8-040, P9-051

**Output:** `Voice session uses Phase 8 context`


### Description
Link Voice Session With AI Teacher Context for Phase 9 Voice Mode. This task belongs to Group F — Voice Orchestration With Phase 8 AI Teacher and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Link Voice Session With AI Teacher Context with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-052.
- Use branch `phase9/P9-052-ai-teacher-voice-context-link`.
- Produce output: `Voice session uses Phase 8 context`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Voice session uses Phase 8 context`.
- Implementation follows `phase9/P9-052-ai-teacher-voice-context-link` scope and task P9-052 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-052 — Link Voice Session With AI Teacher Context for AIM Phase 9 Voice Mode. Use branch `phase9/P9-052-ai-teacher-voice-context-link` and create/update `Voice session uses Phase 8 context`. Dependency: P8-028..P8-040, P9-051. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-052 complete. Branch: phase9/P9-052-ai-teacher-voice-context-link. Output: Voice session uses Phase 8 context. Checks/tests run: <list>. Notes: <summary>.


## #P9-053 — Generate AI Teacher Text Response for Voice

**Group:** Group F — Voice Orchestration With Phase 8 AI Teacher

**Priority:** P0

**Branch:** `phase9/P9-053-voice-response-generation-flow`

**Dependency:** P8-065, P9-051

**Output:** `AI text response from voice transcript`


### Description
Generate AI Teacher Text Response for Voice for Phase 9 Voice Mode. This task belongs to Group F — Voice Orchestration With Phase 8 AI Teacher and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Generate AI Teacher Text Response for Voice with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-053.
- Use branch `phase9/P9-053-voice-response-generation-flow`.
- Produce output: `AI text response from voice transcript`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `AI text response from voice transcript`.
- Implementation follows `phase9/P9-053-voice-response-generation-flow` scope and task P9-053 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-053 — Generate AI Teacher Text Response for Voice for AIM Phase 9 Voice Mode. Use branch `phase9/P9-053-voice-response-generation-flow` and create/update `AI text response from voice transcript`. Dependency: P8-065, P9-051. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-053 complete. Branch: phase9/P9-053-voice-response-generation-flow. Output: AI text response from voice transcript. Checks/tests run: <list>. Notes: <summary>.


## #P9-054 — Persist Voice Conversation Messages

**Group:** Group F — Voice Orchestration With Phase 8 AI Teacher

**Priority:** P0

**Branch:** `phase9/P9-054-voice-message-persistence`

**Dependency:** P9-019, P9-053

**Output:** `Store voice message + transcript + AI response`


### Description
Persist Voice Conversation Messages for Phase 9 Voice Mode. This task belongs to Group F — Voice Orchestration With Phase 8 AI Teacher and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Persist Voice Conversation Messages with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-054.
- Use branch `phase9/P9-054-voice-message-persistence`.
- Produce output: `Store voice message + transcript + AI response`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Store voice message + transcript + AI response`.
- Implementation follows `phase9/P9-054-voice-message-persistence` scope and task P9-054 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-054 — Persist Voice Conversation Messages for AIM Phase 9 Voice Mode. Use branch `phase9/P9-054-voice-message-persistence` and create/update `Store voice message + transcript + AI response`. Dependency: P9-019, P9-053. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-054 complete. Branch: phase9/P9-054-voice-message-persistence. Output: Store voice message + transcript + AI response. Checks/tests run: <list>. Notes: <summary>.


## #P9-055 — Add Voice Rate Limit Policy

**Group:** Group F — Voice Orchestration With Phase 8 AI Teacher

**Priority:** P1

**Branch:** `phase9/P9-055-voice-rate-limit-policy`

**Dependency:** P9-048

**Output:** `Voice usage rate limits`


### Description
Add Voice Rate Limit Policy for Phase 9 Voice Mode. This task belongs to Group F — Voice Orchestration With Phase 8 AI Teacher and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Voice Rate Limit Policy with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-055.
- Use branch `phase9/P9-055-voice-rate-limit-policy`.
- Produce output: `Voice usage rate limits`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Voice usage rate limits`.
- Implementation follows `phase9/P9-055-voice-rate-limit-policy` scope and task P9-055 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-055 — Add Voice Rate Limit Policy for AIM Phase 9 Voice Mode. Use branch `phase9/P9-055-voice-rate-limit-policy` and create/update `Voice usage rate limits`. Dependency: P9-048. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-055 complete. Branch: phase9/P9-055-voice-rate-limit-policy. Output: Voice usage rate limits. Checks/tests run: <list>. Notes: <summary>.


## #P9-056 — Add Voice Fallback to Text Policy

**Group:** Group F — Voice Orchestration With Phase 8 AI Teacher

**Priority:** P1

**Branch:** `phase9/P9-056-voice-safe-fallback-to-text`

**Dependency:** P8-085, P9-016

**Output:** `Text fallback if voice fails`


### Description
Add Voice Fallback to Text Policy for Phase 9 Voice Mode. This task belongs to Group F — Voice Orchestration With Phase 8 AI Teacher and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Voice Fallback to Text Policy with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-056.
- Use branch `phase9/P9-056-voice-safe-fallback-to-text`.
- Produce output: `Text fallback if voice fails`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Text fallback if voice fails`.
- Implementation follows `phase9/P9-056-voice-safe-fallback-to-text` scope and task P9-056 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-056 — Add Voice Fallback to Text Policy for AIM Phase 9 Voice Mode. Use branch `phase9/P9-056-voice-safe-fallback-to-text` and create/update `Text fallback if voice fails`. Dependency: P8-085, P9-016. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-056 complete. Branch: phase9/P9-056-voice-safe-fallback-to-text. Output: Text fallback if voice fails. Checks/tests run: <list>. Notes: <summary>.


## #P9-057 — Add Voice Orchestrator Tests

**Group:** Group F — Voice Orchestration With Phase 8 AI Teacher

**Priority:** P1

**Branch:** `phase9/P9-057-voice-orchestrator-tests`

**Dependency:** P9-048..P9-056

**Output:** `Backend orchestrator tests`


### Description
Add Voice Orchestrator Tests for Phase 9 Voice Mode. This task belongs to Group F — Voice Orchestration With Phase 8 AI Teacher and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Voice Orchestrator Tests with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-057.
- Use branch `phase9/P9-057-voice-orchestrator-tests`.
- Produce output: `Backend orchestrator tests`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Backend orchestrator tests`.
- Implementation follows `phase9/P9-057-voice-orchestrator-tests` scope and task P9-057 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-057 — Add Voice Orchestrator Tests for AIM Phase 9 Voice Mode. Use branch `phase9/P9-057-voice-orchestrator-tests` and create/update `Backend orchestrator tests`. Dependency: P9-048..P9-056. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-057 complete. Branch: phase9/P9-057-voice-orchestrator-tests. Output: Backend orchestrator tests. Checks/tests run: <list>. Notes: <summary>.


## #P9-058 — Create TTS Provider Interface

**Group:** Group G — Text-to-Speech Pipeline

**Priority:** P0

**Branch:** `phase9/P9-058-tts-provider-interface`

**Dependency:** P9-015

**Output:** `Backend TTS abstraction`


### Description
Create TTS Provider Interface for Phase 9 Voice Mode. This task belongs to Group G — Text-to-Speech Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create TTS Provider Interface with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-058.
- Use branch `phase9/P9-058-tts-provider-interface`.
- Produce output: `Backend TTS abstraction`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Backend TTS abstraction`.
- Implementation follows `phase9/P9-058-tts-provider-interface` scope and task P9-058 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-058 — Create TTS Provider Interface for AIM Phase 9 Voice Mode. Use branch `phase9/P9-058-tts-provider-interface` and create/update `Backend TTS abstraction`. Dependency: P9-015. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-058 complete. Branch: phase9/P9-058-tts-provider-interface. Output: Backend TTS abstraction. Checks/tests run: <list>. Notes: <summary>.


## #P9-059 — Add TTS Provider Config

**Group:** Group G — Text-to-Speech Pipeline

**Priority:** P0

**Branch:** `phase9/P9-059-tts-provider-config`

**Dependency:** P9-058

**Output:** `TTS config without committed secrets`


### Description
Add TTS Provider Config for Phase 9 Voice Mode. This task belongs to Group G — Text-to-Speech Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add TTS Provider Config with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-059.
- Use branch `phase9/P9-059-tts-provider-config`.
- Produce output: `TTS config without committed secrets`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `TTS config without committed secrets`.
- Implementation follows `phase9/P9-059-tts-provider-config` scope and task P9-059 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-059 — Add TTS Provider Config for AIM Phase 9 Voice Mode. Use branch `phase9/P9-059-tts-provider-config` and create/update `TTS config without committed secrets`. Dependency: P9-058. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-059 complete. Branch: phase9/P9-059-tts-provider-config. Output: TTS config without committed secrets. Checks/tests run: <list>. Notes: <summary>.


## #P9-060 — Create TTS Request Mapper

**Group:** Group G — Text-to-Speech Pipeline

**Priority:** P1

**Branch:** `phase9/P9-060-tts-request-mapper`

**Dependency:** P9-058

**Output:** `Text-to-TTS request mapping`


### Description
Create TTS Request Mapper for Phase 9 Voice Mode. This task belongs to Group G — Text-to-Speech Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create TTS Request Mapper with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-060.
- Use branch `phase9/P9-060-tts-request-mapper`.
- Produce output: `Text-to-TTS request mapping`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Text-to-TTS request mapping`.
- Implementation follows `phase9/P9-060-tts-request-mapper` scope and task P9-060 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-060 — Create TTS Request Mapper for AIM Phase 9 Voice Mode. Use branch `phase9/P9-060-tts-request-mapper` and create/update `Text-to-TTS request mapping`. Dependency: P9-058. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-060 complete. Branch: phase9/P9-060-tts-request-mapper. Output: Text-to-TTS request mapping. Checks/tests run: <list>. Notes: <summary>.


## #P9-061 — Create TTS Response Mapper

**Group:** Group G — Text-to-Speech Pipeline

**Priority:** P1

**Branch:** `phase9/P9-061-tts-response-mapper`

**Dependency:** P9-058

**Output:** `TTS response normalization`


### Description
Create TTS Response Mapper for Phase 9 Voice Mode. This task belongs to Group G — Text-to-Speech Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create TTS Response Mapper with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-061.
- Use branch `phase9/P9-061-tts-response-mapper`.
- Produce output: `TTS response normalization`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `TTS response normalization`.
- Implementation follows `phase9/P9-061-tts-response-mapper` scope and task P9-061 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-061 — Create TTS Response Mapper for AIM Phase 9 Voice Mode. Use branch `phase9/P9-061-tts-response-mapper` and create/update `TTS response normalization`. Dependency: P9-058. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-061 complete. Branch: phase9/P9-061-tts-response-mapper. Output: TTS response normalization. Checks/tests run: <list>. Notes: <summary>.


## #P9-062 — Add TTS Voice Selection Policy

**Group:** Group G — Text-to-Speech Pipeline

**Priority:** P0

**Branch:** `phase9/P9-062-tts-voice-selection-policy`

**Dependency:** P9-058

**Output:** `Voice selection/language rules`


### Description
Add TTS Voice Selection Policy for Phase 9 Voice Mode. This task belongs to Group G — Text-to-Speech Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add TTS Voice Selection Policy with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-062.
- Use branch `phase9/P9-062-tts-voice-selection-policy`.
- Produce output: `Voice selection/language rules`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Voice selection/language rules`.
- Implementation follows `phase9/P9-062-tts-voice-selection-policy` scope and task P9-062 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-062 — Add TTS Voice Selection Policy for AIM Phase 9 Voice Mode. Use branch `phase9/P9-062-tts-voice-selection-policy` and create/update `Voice selection/language rules`. Dependency: P9-058. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-062 complete. Branch: phase9/P9-062-tts-voice-selection-policy. Output: Voice selection/language rules. Checks/tests run: <list>. Notes: <summary>.


## #P9-063 — Build TTS Audio Generation Service

**Group:** Group G — Text-to-Speech Pipeline

**Priority:** P0

**Branch:** `phase9/P9-063-tts-audio-generation-service`

**Dependency:** P9-053, P9-060

**Output:** `Generate audio from AI response`


### Description
Build TTS Audio Generation Service for Phase 9 Voice Mode. This task belongs to Group G — Text-to-Speech Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build TTS Audio Generation Service with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-063.
- Use branch `phase9/P9-063-tts-audio-generation-service`.
- Produce output: `Generate audio from AI response`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Generate audio from AI response`.
- Implementation follows `phase9/P9-063-tts-audio-generation-service` scope and task P9-063 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-063 — Build TTS Audio Generation Service for AIM Phase 9 Voice Mode. Use branch `phase9/P9-063-tts-audio-generation-service` and create/update `Generate audio from AI response`. Dependency: P9-053, P9-060. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-063 complete. Branch: phase9/P9-063-tts-audio-generation-service. Output: Generate audio from AI response. Checks/tests run: <list>. Notes: <summary>.


## #P9-064 — Store Generated TTS Audio

**Group:** Group G — Text-to-Speech Pipeline

**Priority:** P0

**Branch:** `phase9/P9-064-tts-audio-storage`

**Dependency:** P9-020, P9-063

**Output:** `Store generated audio safely`


### Description
Store Generated TTS Audio for Phase 9 Voice Mode. This task belongs to Group G — Text-to-Speech Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Store Generated TTS Audio with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-064.
- Use branch `phase9/P9-064-tts-audio-storage`.
- Produce output: `Store generated audio safely`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Store generated audio safely`.
- Implementation follows `phase9/P9-064-tts-audio-storage` scope and task P9-064 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-064 — Store Generated TTS Audio for AIM Phase 9 Voice Mode. Use branch `phase9/P9-064-tts-audio-storage` and create/update `Store generated audio safely`. Dependency: P9-020, P9-063. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-064 complete. Branch: phase9/P9-064-tts-audio-storage. Output: Store generated audio safely. Checks/tests run: <list>. Notes: <summary>.


## #P9-065 — Add TTS Safe Failure Handling

**Group:** Group G — Text-to-Speech Pipeline

**Priority:** P1

**Branch:** `phase9/P9-065-tts-safe-failure`

**Dependency:** P9-016, P9-063

**Output:** `Safe fallback if TTS fails`


### Description
Add TTS Safe Failure Handling for Phase 9 Voice Mode. This task belongs to Group G — Text-to-Speech Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add TTS Safe Failure Handling with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-065.
- Use branch `phase9/P9-065-tts-safe-failure`.
- Produce output: `Safe fallback if TTS fails`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Safe fallback if TTS fails`.
- Implementation follows `phase9/P9-065-tts-safe-failure` scope and task P9-065 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-065 — Add TTS Safe Failure Handling for AIM Phase 9 Voice Mode. Use branch `phase9/P9-065-tts-safe-failure` and create/update `Safe fallback if TTS fails`. Dependency: P9-016, P9-063. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-065 complete. Branch: phase9/P9-065-tts-safe-failure. Output: Safe fallback if TTS fails. Checks/tests run: <list>. Notes: <summary>.


## #P9-066 — Add TTS Provider Tests

**Group:** Group G — Text-to-Speech Pipeline

**Priority:** P1

**Branch:** `phase9/P9-066-tts-provider-tests`

**Dependency:** P9-058..P9-065

**Output:** `Backend TTS tests`


### Description
Add TTS Provider Tests for Phase 9 Voice Mode. This task belongs to Group G — Text-to-Speech Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add TTS Provider Tests with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-066.
- Use branch `phase9/P9-066-tts-provider-tests`.
- Produce output: `Backend TTS tests`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Backend TTS tests`.
- Implementation follows `phase9/P9-066-tts-provider-tests` scope and task P9-066 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-066 — Add TTS Provider Tests for AIM Phase 9 Voice Mode. Use branch `phase9/P9-066-tts-provider-tests` and create/update `Backend TTS tests`. Dependency: P9-058..P9-065. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-066 complete. Branch: phase9/P9-066-tts-provider-tests. Output: Backend TTS tests. Checks/tests run: <list>. Notes: <summary>.


## #P9-067 — Verify TTS Secrets Are Not Committed

**Group:** Group G — Text-to-Speech Pipeline

**Priority:** P0

**Branch:** `phase9/P9-067-tts-no-secret-check`

**Dependency:** P9-059

**Output:** `Secret safety check`


### Description
Verify TTS Secrets Are Not Committed for Phase 9 Voice Mode. This task belongs to Group G — Text-to-Speech Pipeline and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Verify TTS Secrets Are Not Committed with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-067.
- Use branch `phase9/P9-067-tts-no-secret-check`.
- Produce output: `Secret safety check`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Secret safety check`.
- Implementation follows `phase9/P9-067-tts-no-secret-check` scope and task P9-067 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-067 — Verify TTS Secrets Are Not Committed for AIM Phase 9 Voice Mode. Use branch `phase9/P9-067-tts-no-secret-check` and create/update `Secret safety check`. Dependency: P9-059. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-067 complete. Branch: phase9/P9-067-tts-no-secret-check. Output: Secret safety check. Checks/tests run: <list>. Notes: <summary>.


## #P9-068 — Create Start Voice Session API

**Group:** Group H — Voice API Endpoints

**Priority:** P0

**Branch:** `phase9/P9-068-voice-session-start-api`

**Dependency:** P9-049

**Output:** `POST /voice-teacher/sessions`


### Description
Create Start Voice Session API for Phase 9 Voice Mode. This task belongs to Group H — Voice API Endpoints and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Start Voice Session API with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-068.
- Use branch `phase9/P9-068-voice-session-start-api`.
- Produce output: `POST /voice-teacher/sessions`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `POST /voice-teacher/sessions`.
- Implementation follows `phase9/P9-068-voice-session-start-api` scope and task P9-068 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-068 — Create Start Voice Session API for AIM Phase 9 Voice Mode. Use branch `phase9/P9-068-voice-session-start-api` and create/update `POST /voice-teacher/sessions`. Dependency: P9-049. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-068 complete. Branch: phase9/P9-068-voice-session-start-api. Output: POST /voice-teacher/sessions. Checks/tests run: <list>. Notes: <summary>.


## #P9-069 — Create Voice Audio Submit API

**Group:** Group H — Voice API Endpoints

**Priority:** P0

**Branch:** `phase9/P9-069-voice-audio-submit-api`

**Dependency:** P9-050, P9-053

**Output:** `POST /voice-teacher/sessions/:id/audio`


### Description
Create Voice Audio Submit API for Phase 9 Voice Mode. This task belongs to Group H — Voice API Endpoints and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Audio Submit API with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-069.
- Use branch `phase9/P9-069-voice-audio-submit-api`.
- Produce output: `POST /voice-teacher/sessions/:id/audio`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `POST /voice-teacher/sessions/:id/audio`.
- Implementation follows `phase9/P9-069-voice-audio-submit-api` scope and task P9-069 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-069 — Create Voice Audio Submit API for AIM Phase 9 Voice Mode. Use branch `phase9/P9-069-voice-audio-submit-api` and create/update `POST /voice-teacher/sessions/:id/audio`. Dependency: P9-050, P9-053. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-069 complete. Branch: phase9/P9-069-voice-audio-submit-api. Output: POST /voice-teacher/sessions/:id/audio. Checks/tests run: <list>. Notes: <summary>.


## #P9-070 — Create Voice Session History API

**Group:** Group H — Voice API Endpoints

**Priority:** P0

**Branch:** `phase9/P9-070-voice-session-history-api`

**Dependency:** P9-054

**Output:** `GET /voice-teacher/sessions/:id/messages`


### Description
Create Voice Session History API for Phase 9 Voice Mode. This task belongs to Group H — Voice API Endpoints and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Session History API with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-070.
- Use branch `phase9/P9-070-voice-session-history-api`.
- Produce output: `GET /voice-teacher/sessions/:id/messages`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `GET /voice-teacher/sessions/:id/messages`.
- Implementation follows `phase9/P9-070-voice-session-history-api` scope and task P9-070 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-070 — Create Voice Session History API for AIM Phase 9 Voice Mode. Use branch `phase9/P9-070-voice-session-history-api` and create/update `GET /voice-teacher/sessions/:id/messages`. Dependency: P9-054. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-070 complete. Branch: phase9/P9-070-voice-session-history-api. Output: GET /voice-teacher/sessions/:id/messages. Checks/tests run: <list>. Notes: <summary>.


## #P9-071 — Create Voice Session List API

**Group:** Group H — Voice API Endpoints

**Priority:** P1

**Branch:** `phase9/P9-071-voice-session-list-api`

**Dependency:** P9-049

**Output:** `GET /voice-teacher/sessions`


### Description
Create Voice Session List API for Phase 9 Voice Mode. This task belongs to Group H — Voice API Endpoints and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Session List API with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-071.
- Use branch `phase9/P9-071-voice-session-list-api`.
- Produce output: `GET /voice-teacher/sessions`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `GET /voice-teacher/sessions`.
- Implementation follows `phase9/P9-071-voice-session-list-api` scope and task P9-071 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-071 — Create Voice Session List API for AIM Phase 9 Voice Mode. Use branch `phase9/P9-071-voice-session-list-api` and create/update `GET /voice-teacher/sessions`. Dependency: P9-049. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-071 complete. Branch: phase9/P9-071-voice-session-list-api. Output: GET /voice-teacher/sessions. Checks/tests run: <list>. Notes: <summary>.


## #P9-072 — Create Voice Audio Playback API

**Group:** Group H — Voice API Endpoints

**Priority:** P0

**Branch:** `phase9/P9-072-voice-audio-playback-api`

**Dependency:** P9-064

**Output:** `Secure audio playback endpoint`


### Description
Create Voice Audio Playback API for Phase 9 Voice Mode. This task belongs to Group H — Voice API Endpoints and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Audio Playback API with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-072.
- Use branch `phase9/P9-072-voice-audio-playback-api`.
- Produce output: `Secure audio playback endpoint`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Secure audio playback endpoint`.
- Implementation follows `phase9/P9-072-voice-audio-playback-api` scope and task P9-072 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-072 — Create Voice Audio Playback API for AIM Phase 9 Voice Mode. Use branch `phase9/P9-072-voice-audio-playback-api` and create/update `Secure audio playback endpoint`. Dependency: P9-064. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-072 complete. Branch: phase9/P9-072-voice-audio-playback-api. Output: Secure audio playback endpoint. Checks/tests run: <list>. Notes: <summary>.


## #P9-073 — Create Voice Feedback API

**Group:** Group H — Voice API Endpoints

**Priority:** P1

**Branch:** `phase9/P9-073-voice-feedback-api`

**Dependency:** P9-024, P9-054

**Output:** `Voice feedback endpoint`


### Description
Create Voice Feedback API for Phase 9 Voice Mode. This task belongs to Group H — Voice API Endpoints and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Feedback API with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-073.
- Use branch `phase9/P9-073-voice-feedback-api`.
- Produce output: `Voice feedback endpoint`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Voice feedback endpoint`.
- Implementation follows `phase9/P9-073-voice-feedback-api` scope and task P9-073 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-073 — Create Voice Feedback API for AIM Phase 9 Voice Mode. Use branch `phase9/P9-073-voice-feedback-api` and create/update `Voice feedback endpoint`. Dependency: P9-024, P9-054. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-073 complete. Branch: phase9/P9-073-voice-feedback-api. Output: Voice feedback endpoint. Checks/tests run: <list>. Notes: <summary>.


## #P9-074 — Add Voice API Guards

**Group:** Group H — Voice API Endpoints

**Priority:** P0

**Branch:** `phase9/P9-074-voice-api-guards`

**Dependency:** P9-068..P9-073

**Output:** `Auth/ownership guards`


### Description
Add Voice API Guards for Phase 9 Voice Mode. This task belongs to Group H — Voice API Endpoints and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Voice API Guards with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-074.
- Use branch `phase9/P9-074-voice-api-guards`.
- Produce output: `Auth/ownership guards`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Auth/ownership guards`.
- Implementation follows `phase9/P9-074-voice-api-guards` scope and task P9-074 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-074 — Add Voice API Guards for AIM Phase 9 Voice Mode. Use branch `phase9/P9-074-voice-api-guards` and create/update `Auth/ownership guards`. Dependency: P9-068..P9-073. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-074 complete. Branch: phase9/P9-074-voice-api-guards. Output: Auth/ownership guards. Checks/tests run: <list>. Notes: <summary>.


## #P9-075 — Add Voice API DTO Validation

**Group:** Group H — Voice API Endpoints

**Priority:** P0

**Branch:** `phase9/P9-075-voice-api-dto-validation`

**Dependency:** P9-068..P9-073

**Output:** `Backend DTO validation`


### Description
Add Voice API DTO Validation for Phase 9 Voice Mode. This task belongs to Group H — Voice API Endpoints and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Voice API DTO Validation with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-075.
- Use branch `phase9/P9-075-voice-api-dto-validation`.
- Produce output: `Backend DTO validation`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Backend DTO validation`.
- Implementation follows `phase9/P9-075-voice-api-dto-validation` scope and task P9-075 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-075 — Add Voice API DTO Validation for AIM Phase 9 Voice Mode. Use branch `phase9/P9-075-voice-api-dto-validation` and create/update `Backend DTO validation`. Dependency: P9-068..P9-073. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-075 complete. Branch: phase9/P9-075-voice-api-dto-validation. Output: Backend DTO validation. Checks/tests run: <list>. Notes: <summary>.


## #P9-076 — Add Voice API Tests

**Group:** Group H — Voice API Endpoints

**Priority:** P1

**Branch:** `phase9/P9-076-voice-api-tests`

**Dependency:** P9-068..P9-075

**Output:** `Backend Voice API tests`


### Description
Add Voice API Tests for Phase 9 Voice Mode. This task belongs to Group H — Voice API Endpoints and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Voice API Tests with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-076.
- Use branch `phase9/P9-076-voice-api-tests`.
- Produce output: `Backend Voice API tests`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `Backend Voice API tests`.
- Implementation follows `phase9/P9-076-voice-api-tests` scope and task P9-076 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-076 — Add Voice API Tests for AIM Phase 9 Voice Mode. Use branch `phase9/P9-076-voice-api-tests` and create/update `Backend Voice API tests`. Dependency: P9-068..P9-075. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-076 complete. Branch: phase9/P9-076-voice-api-tests. Output: Backend Voice API tests. Checks/tests run: <list>. Notes: <summary>.


## #P9-077 — Run Voice API Security Review

**Group:** Group H — Voice API Endpoints

**Priority:** P0

**Branch:** `phase9/P9-077-voice-api-security-review`

**Dependency:** P9-076

**Output:** `docs/quality/phase-9-voice-api-security-review.md`


### Description
Run Voice API Security Review for Phase 9 Voice Mode. This task belongs to Group H — Voice API Endpoints and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Run Voice API Security Review with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-077.
- Use branch `phase9/P9-077-voice-api-security-review`.
- Produce output: `docs/quality/phase-9-voice-api-security-review.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/quality/phase-9-voice-api-security-review.md`.
- Implementation follows `phase9/P9-077-voice-api-security-review` scope and task P9-077 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-077 — Run Voice API Security Review for AIM Phase 9 Voice Mode. Use branch `phase9/P9-077-voice-api-security-review` and create/update `docs/quality/phase-9-voice-api-security-review.md`. Dependency: P9-076. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-077 complete. Branch: phase9/P9-077-voice-api-security-review. Output: docs/quality/phase-9-voice-api-security-review.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-078 — Create Flutter Voice Teacher Feature Structure

**Group:** Group I — Flutter Voice Teacher UI

**Priority:** P0

**Branch:** `phase9/P9-078-flutter-voice-feature-structure`

**Dependency:** P6-020, P8-080

**Output:** `features/voice_teacher/...`


### Description
Create Flutter Voice Teacher Feature Structure for Phase 9 Voice Mode. This task belongs to Group I — Flutter Voice Teacher UI and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Flutter Voice Teacher Feature Structure with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-078.
- Use branch `phase9/P9-078-flutter-voice-feature-structure`.
- Produce output: `features/voice_teacher/...`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `features/voice_teacher/...`.
- Implementation follows `phase9/P9-078-flutter-voice-feature-structure` scope and task P9-078 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-078 — Create Flutter Voice Teacher Feature Structure for AIM Phase 9 Voice Mode. Use branch `phase9/P9-078-flutter-voice-feature-structure` and create/update `features/voice_teacher/...`. Dependency: P6-020, P8-080. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-078 complete. Branch: phase9/P9-078-flutter-voice-feature-structure. Output: features/voice_teacher/.... Checks/tests run: <list>. Notes: <summary>.


## #P9-079 — Build Microphone Permission Flow

**Group:** Group I — Flutter Voice Teacher UI

**Priority:** P0

**Branch:** `phase9/P9-079-flutter-microphone-permission-flow`

**Dependency:** P9-078

**Output:** `Mobile microphone permission handling`


### Description
Build Microphone Permission Flow for Phase 9 Voice Mode. This task belongs to Group I — Flutter Voice Teacher UI and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build Microphone Permission Flow with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-079.
- Use branch `phase9/P9-079-flutter-microphone-permission-flow`.
- Produce output: `Mobile microphone permission handling`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Mobile microphone permission handling`.
- Implementation follows `phase9/P9-079-flutter-microphone-permission-flow` scope and task P9-079 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-079 — Build Microphone Permission Flow for AIM Phase 9 Voice Mode. Use branch `phase9/P9-079-flutter-microphone-permission-flow` and create/update `Mobile microphone permission handling`. Dependency: P9-078. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-079 complete. Branch: phase9/P9-079-flutter-microphone-permission-flow. Output: Mobile microphone permission handling. Checks/tests run: <list>. Notes: <summary>.


## #P9-080 — Add Flutter Voice Models

**Group:** Group I — Flutter Voice Teacher UI

**Priority:** P0

**Branch:** `phase9/P9-080-flutter-voice-models`

**Dependency:** P9-068..P9-073

**Output:** `Voice session/message models`


### Description
Add Flutter Voice Models for Phase 9 Voice Mode. This task belongs to Group I — Flutter Voice Teacher UI and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Flutter Voice Models with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-080.
- Use branch `phase9/P9-080-flutter-voice-models`.
- Produce output: `Voice session/message models`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Voice session/message models`.
- Implementation follows `phase9/P9-080-flutter-voice-models` scope and task P9-080 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-080 — Add Flutter Voice Models for AIM Phase 9 Voice Mode. Use branch `phase9/P9-080-flutter-voice-models` and create/update `Voice session/message models`. Dependency: P9-068..P9-073. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-080 complete. Branch: phase9/P9-080-flutter-voice-models. Output: Voice session/message models. Checks/tests run: <list>. Notes: <summary>.


## #P9-081 — Add Flutter Voice Datasource

**Group:** Group I — Flutter Voice Teacher UI

**Priority:** P0

**Branch:** `phase9/P9-081-flutter-voice-datasource`

**Dependency:** P9-068..P9-073, P9-080

**Output:** `Backend voice API datasource`


### Description
Add Flutter Voice Datasource for Phase 9 Voice Mode. This task belongs to Group I — Flutter Voice Teacher UI and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Flutter Voice Datasource with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-081.
- Use branch `phase9/P9-081-flutter-voice-datasource`.
- Produce output: `Backend voice API datasource`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Backend voice API datasource`.
- Implementation follows `phase9/P9-081-flutter-voice-datasource` scope and task P9-081 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-081 — Add Flutter Voice Datasource for AIM Phase 9 Voice Mode. Use branch `phase9/P9-081-flutter-voice-datasource` and create/update `Backend voice API datasource`. Dependency: P9-068..P9-073, P9-080. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-081 complete. Branch: phase9/P9-081-flutter-voice-datasource. Output: Backend voice API datasource. Checks/tests run: <list>. Notes: <summary>.


## #P9-082 — Add Voice Repository/Provider

**Group:** Group I — Flutter Voice Teacher UI

**Priority:** P0

**Branch:** `phase9/P9-082-flutter-voice-repository-provider`

**Dependency:** P9-081

**Output:** `Flutter voice repository/provider`


### Description
Add Voice Repository/Provider for Phase 9 Voice Mode. This task belongs to Group I — Flutter Voice Teacher UI and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Voice Repository/Provider with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-082.
- Use branch `phase9/P9-082-flutter-voice-repository-provider`.
- Produce output: `Flutter voice repository/provider`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Flutter voice repository/provider`.
- Implementation follows `phase9/P9-082-flutter-voice-repository-provider` scope and task P9-082 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-082 — Add Voice Repository/Provider for AIM Phase 9 Voice Mode. Use branch `phase9/P9-082-flutter-voice-repository-provider` and create/update `Flutter voice repository/provider`. Dependency: P9-081. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-082 complete. Branch: phase9/P9-082-flutter-voice-repository-provider. Output: Flutter voice repository/provider. Checks/tests run: <list>. Notes: <summary>.


## #P9-083 — Build Voice Teacher Entry Card

**Group:** Group I — Flutter Voice Teacher UI

**Priority:** P1

**Branch:** `phase9/P9-083-flutter-voice-entry-card`

**Dependency:** P6-027, P6-028, P6-029, P9-082

**Output:** `Entry card using AIM Mobile Design System`


### Description
Build Voice Teacher Entry Card for Phase 9 Voice Mode. This task belongs to Group I — Flutter Voice Teacher UI and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build Voice Teacher Entry Card with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-083.
- Use branch `phase9/P9-083-flutter-voice-entry-card`.
- Produce output: `Entry card using AIM Mobile Design System`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Entry card using AIM Mobile Design System`.
- Implementation follows `phase9/P9-083-flutter-voice-entry-card` scope and task P9-083 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-083 — Build Voice Teacher Entry Card for AIM Phase 9 Voice Mode. Use branch `phase9/P9-083-flutter-voice-entry-card` and create/update `Entry card using AIM Mobile Design System`. Dependency: P6-027, P6-028, P6-029, P9-082. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-083 complete. Branch: phase9/P9-083-flutter-voice-entry-card. Output: Entry card using AIM Mobile Design System. Checks/tests run: <list>. Notes: <summary>.


## #P9-084 — Build Voice Teacher Screen

**Group:** Group I — Flutter Voice Teacher UI

**Priority:** P0

**Branch:** `phase9/P9-084-flutter-voice-screen`

**Dependency:** P6-027, P6-028, P6-029, P9-082

**Output:** `Voice screen using AIM Mobile Design System`


### Description
Build Voice Teacher Screen for Phase 9 Voice Mode. This task belongs to Group I — Flutter Voice Teacher UI and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build Voice Teacher Screen with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-084.
- Use branch `phase9/P9-084-flutter-voice-screen`.
- Produce output: `Voice screen using AIM Mobile Design System`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Voice screen using AIM Mobile Design System`.
- Implementation follows `phase9/P9-084-flutter-voice-screen` scope and task P9-084 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-084 — Build Voice Teacher Screen for AIM Phase 9 Voice Mode. Use branch `phase9/P9-084-flutter-voice-screen` and create/update `Voice screen using AIM Mobile Design System`. Dependency: P6-027, P6-028, P6-029, P9-082. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-084 complete. Branch: phase9/P9-084-flutter-voice-screen. Output: Voice screen using AIM Mobile Design System. Checks/tests run: <list>. Notes: <summary>.


## #P9-085 — Build Record Button Widget

**Group:** Group I — Flutter Voice Teacher UI

**Priority:** P0

**Branch:** `phase9/P9-085-flutter-record-button`

**Dependency:** P6-027, P6-028, P9-084

**Output:** `Record button using design system`


### Description
Build Record Button Widget for Phase 9 Voice Mode. This task belongs to Group I — Flutter Voice Teacher UI and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build Record Button Widget with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-085.
- Use branch `phase9/P9-085-flutter-record-button`.
- Produce output: `Record button using design system`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Record button using design system`.
- Implementation follows `phase9/P9-085-flutter-record-button` scope and task P9-085 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-085 — Build Record Button Widget for AIM Phase 9 Voice Mode. Use branch `phase9/P9-085-flutter-record-button` and create/update `Record button using design system`. Dependency: P6-027, P6-028, P9-084. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-085 complete. Branch: phase9/P9-085-flutter-record-button. Output: Record button using design system. Checks/tests run: <list>. Notes: <summary>.


## #P9-086 — Build Recording State UI

**Group:** Group I — Flutter Voice Teacher UI

**Priority:** P1

**Branch:** `phase9/P9-086-flutter-recording-state-ui`

**Dependency:** P9-085

**Output:** `Recording/stop/cancel states`


### Description
Build Recording State UI for Phase 9 Voice Mode. This task belongs to Group I — Flutter Voice Teacher UI and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build Recording State UI with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-086.
- Use branch `phase9/P9-086-flutter-recording-state-ui`.
- Produce output: `Recording/stop/cancel states`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Recording/stop/cancel states`.
- Implementation follows `phase9/P9-086-flutter-recording-state-ui` scope and task P9-086 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-086 — Build Recording State UI for AIM Phase 9 Voice Mode. Use branch `phase9/P9-086-flutter-recording-state-ui` and create/update `Recording/stop/cancel states`. Dependency: P9-085. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-086 complete. Branch: phase9/P9-086-flutter-recording-state-ui. Output: Recording/stop/cancel states. Checks/tests run: <list>. Notes: <summary>.


## #P9-087 — Build Voice Waveform/Recording Indicator

**Group:** Group I — Flutter Voice Teacher UI

**Priority:** P1

**Branch:** `phase9/P9-087-flutter-waveform-indicator`

**Dependency:** P6-027, P6-028, P9-086

**Output:** `Voice indicator using design system`


### Description
Build Voice Waveform/Recording Indicator for Phase 9 Voice Mode. This task belongs to Group I — Flutter Voice Teacher UI and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build Voice Waveform/Recording Indicator with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-087.
- Use branch `phase9/P9-087-flutter-waveform-indicator`.
- Produce output: `Voice indicator using design system`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Voice indicator using design system`.
- Implementation follows `phase9/P9-087-flutter-waveform-indicator` scope and task P9-087 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-087 — Build Voice Waveform/Recording Indicator for AIM Phase 9 Voice Mode. Use branch `phase9/P9-087-flutter-waveform-indicator` and create/update `Voice indicator using design system`. Dependency: P6-027, P6-028, P9-086. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-087 complete. Branch: phase9/P9-087-flutter-waveform-indicator. Output: Voice indicator using design system. Checks/tests run: <list>. Notes: <summary>.


## #P9-088 — Build Transcription Preview UI

**Group:** Group I — Flutter Voice Teacher UI

**Priority:** P0

**Branch:** `phase9/P9-088-flutter-transcription-preview`

**Dependency:** P6-014, P6-029, P9-084

**Output:** `Transcript preview with RTL/Arabic support`


### Description
Build Transcription Preview UI for Phase 9 Voice Mode. This task belongs to Group I — Flutter Voice Teacher UI and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build Transcription Preview UI with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-088.
- Use branch `phase9/P9-088-flutter-transcription-preview`.
- Produce output: `Transcript preview with RTL/Arabic support`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Transcript preview with RTL/Arabic support`.
- Implementation follows `phase9/P9-088-flutter-transcription-preview` scope and task P9-088 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-088 — Build Transcription Preview UI for AIM Phase 9 Voice Mode. Use branch `phase9/P9-088-flutter-transcription-preview` and create/update `Transcript preview with RTL/Arabic support`. Dependency: P6-014, P6-029, P9-084. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-088 complete. Branch: phase9/P9-088-flutter-transcription-preview. Output: Transcript preview with RTL/Arabic support. Checks/tests run: <list>. Notes: <summary>.


## #P9-089 — Build AI Speaking/Loading State

**Group:** Group I — Flutter Voice Teacher UI

**Priority:** P1

**Branch:** `phase9/P9-089-flutter-ai-speaking-state`

**Dependency:** P6-025, P9-084

**Output:** `AI voice response loading state`


### Description
Build AI Speaking/Loading State for Phase 9 Voice Mode. This task belongs to Group I — Flutter Voice Teacher UI and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build AI Speaking/Loading State with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-089.
- Use branch `phase9/P9-089-flutter-ai-speaking-state`.
- Produce output: `AI voice response loading state`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `AI voice response loading state`.
- Implementation follows `phase9/P9-089-flutter-ai-speaking-state` scope and task P9-089 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-089 — Build AI Speaking/Loading State for AIM Phase 9 Voice Mode. Use branch `phase9/P9-089-flutter-ai-speaking-state` and create/update `AI voice response loading state`. Dependency: P6-025, P9-084. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-089 complete. Branch: phase9/P9-089-flutter-ai-speaking-state. Output: AI voice response loading state. Checks/tests run: <list>. Notes: <summary>.


## #P9-090 — Build Audio Playback Controls

**Group:** Group I — Flutter Voice Teacher UI

**Priority:** P0

**Branch:** `phase9/P9-090-flutter-audio-playback-controls`

**Dependency:** P9-072, P9-084

**Output:** `Play/pause/replay controls`


### Description
Build Audio Playback Controls for Phase 9 Voice Mode. This task belongs to Group I — Flutter Voice Teacher UI and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build Audio Playback Controls with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-090.
- Use branch `phase9/P9-090-flutter-audio-playback-controls`.
- Produce output: `Play/pause/replay controls`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Play/pause/replay controls`.
- Implementation follows `phase9/P9-090-flutter-audio-playback-controls` scope and task P9-090 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-090 — Build Audio Playback Controls for AIM Phase 9 Voice Mode. Use branch `phase9/P9-090-flutter-audio-playback-controls` and create/update `Play/pause/replay controls`. Dependency: P9-072, P9-084. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-090 complete. Branch: phase9/P9-090-flutter-audio-playback-controls. Output: Play/pause/replay controls. Checks/tests run: <list>. Notes: <summary>.


## #P9-091 — Build Voice Error State

**Group:** Group I — Flutter Voice Teacher UI

**Priority:** P0

**Branch:** `phase9/P9-091-flutter-voice-error-state`

**Dependency:** P6-025, P9-056, P9-084

**Output:** `Safe error UI with text fallback`


### Description
Build Voice Error State for Phase 9 Voice Mode. This task belongs to Group I — Flutter Voice Teacher UI and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build Voice Error State with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-091.
- Use branch `phase9/P9-091-flutter-voice-error-state`.
- Produce output: `Safe error UI with text fallback`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Safe error UI with text fallback`.
- Implementation follows `phase9/P9-091-flutter-voice-error-state` scope and task P9-091 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-091 — Build Voice Error State for AIM Phase 9 Voice Mode. Use branch `phase9/P9-091-flutter-voice-error-state` and create/update `Safe error UI with text fallback`. Dependency: P6-025, P9-056, P9-084. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-091 complete. Branch: phase9/P9-091-flutter-voice-error-state. Output: Safe error UI with text fallback. Checks/tests run: <list>. Notes: <summary>.


## #P9-092 — Build Voice Feedback Actions

**Group:** Group I — Flutter Voice Teacher UI

**Priority:** P1

**Branch:** `phase9/P9-092-flutter-voice-feedback-actions`

**Dependency:** P9-073, P9-084

**Output:** `Helpful/not helpful feedback UI`


### Description
Build Voice Feedback Actions for Phase 9 Voice Mode. This task belongs to Group I — Flutter Voice Teacher UI and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build Voice Feedback Actions with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-092.
- Use branch `phase9/P9-092-flutter-voice-feedback-actions`.
- Produce output: `Helpful/not helpful feedback UI`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Helpful/not helpful feedback UI`.
- Implementation follows `phase9/P9-092-flutter-voice-feedback-actions` scope and task P9-092 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-092 — Build Voice Feedback Actions for AIM Phase 9 Voice Mode. Use branch `phase9/P9-092-flutter-voice-feedback-actions` and create/update `Helpful/not helpful feedback UI`. Dependency: P9-073, P9-084. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-092 complete. Branch: phase9/P9-092-flutter-voice-feedback-actions. Output: Helpful/not helpful feedback UI. Checks/tests run: <list>. Notes: <summary>.


## #P9-093 — Build Record and Submit Flow

**Group:** Group J — Flutter Voice Integration & QA

**Priority:** P0

**Branch:** `phase9/P9-093-flutter-record-submit-flow`

**Dependency:** P9-079, P9-081, P9-085

**Output:** `Flutter audio recording to backend submit flow`


### Description
Build Record and Submit Flow for Phase 9 Voice Mode. This task belongs to Group J — Flutter Voice Integration & QA and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build Record and Submit Flow with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-093.
- Use branch `phase9/P9-093-flutter-record-submit-flow`.
- Produce output: `Flutter audio recording to backend submit flow`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Flutter audio recording to backend submit flow`.
- Implementation follows `phase9/P9-093-flutter-record-submit-flow` scope and task P9-093 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-093 — Build Record and Submit Flow for AIM Phase 9 Voice Mode. Use branch `phase9/P9-093-flutter-record-submit-flow` and create/update `Flutter audio recording to backend submit flow`. Dependency: P9-079, P9-081, P9-085. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-093 complete. Branch: phase9/P9-093-flutter-record-submit-flow. Output: Flutter audio recording to backend submit flow. Checks/tests run: <list>. Notes: <summary>.


## #P9-094 — Build Voice Response Playback Flow

**Group:** Group J — Flutter Voice Integration & QA

**Priority:** P0

**Branch:** `phase9/P9-094-flutter-voice-response-playback-flow`

**Dependency:** P9-090, P9-093

**Output:** `Receive and play backend TTS response`


### Description
Build Voice Response Playback Flow for Phase 9 Voice Mode. This task belongs to Group J — Flutter Voice Integration & QA and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Build Voice Response Playback Flow with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-094.
- Use branch `phase9/P9-094-flutter-voice-response-playback-flow`.
- Produce output: `Receive and play backend TTS response`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Receive and play backend TTS response`.
- Implementation follows `phase9/P9-094-flutter-voice-response-playback-flow` scope and task P9-094 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-094 — Build Voice Response Playback Flow for AIM Phase 9 Voice Mode. Use branch `phase9/P9-094-flutter-voice-response-playback-flow` and create/update `Receive and play backend TTS response`. Dependency: P9-090, P9-093. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-094 complete. Branch: phase9/P9-094-flutter-voice-response-playback-flow. Output: Receive and play backend TTS response. Checks/tests run: <list>. Notes: <summary>.


## #P9-095 — Add Voice-to-Text Fallback UI

**Group:** Group J — Flutter Voice Integration & QA

**Priority:** P0

**Branch:** `phase9/P9-095-flutter-voice-to-text-fallback`

**Dependency:** P8-085, P9-091

**Output:** `Text fallback from failed voice`


### Description
Add Voice-to-Text Fallback UI for Phase 9 Voice Mode. This task belongs to Group J — Flutter Voice Integration & QA and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Voice-to-Text Fallback UI with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-095.
- Use branch `phase9/P9-095-flutter-voice-to-text-fallback`.
- Produce output: `Text fallback from failed voice`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Text fallback from failed voice`.
- Implementation follows `phase9/P9-095-flutter-voice-to-text-fallback` scope and task P9-095 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-095 — Add Voice-to-Text Fallback UI for AIM Phase 9 Voice Mode. Use branch `phase9/P9-095-flutter-voice-to-text-fallback` and create/update `Text fallback from failed voice`. Dependency: P8-085, P9-091. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-095 complete. Branch: phase9/P9-095-flutter-voice-to-text-fallback. Output: Text fallback from failed voice. Checks/tests run: <list>. Notes: <summary>.


## #P9-096 — Verify Flutter Has No Direct Provider Calls

**Group:** Group J — Flutter Voice Integration & QA

**Priority:** P0

**Branch:** `phase9/P9-096-flutter-no-direct-provider-check`

**Dependency:** P9-081..P9-095

**Output:** `No direct STT/TTS/AI provider regression`


### Description
Verify Flutter Has No Direct Provider Calls for Phase 9 Voice Mode. This task belongs to Group J — Flutter Voice Integration & QA and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Verify Flutter Has No Direct Provider Calls with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-096.
- Use branch `phase9/P9-096-flutter-no-direct-provider-check`.
- Produce output: `No direct STT/TTS/AI provider regression`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `No direct STT/TTS/AI provider regression`.
- Implementation follows `phase9/P9-096-flutter-no-direct-provider-check` scope and task P9-096 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-096 — Verify Flutter Has No Direct Provider Calls for AIM Phase 9 Voice Mode. Use branch `phase9/P9-096-flutter-no-direct-provider-check` and create/update `No direct STT/TTS/AI provider regression`. Dependency: P9-081..P9-095. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-096 complete. Branch: phase9/P9-096-flutter-no-direct-provider-check. Output: No direct STT/TTS/AI provider regression. Checks/tests run: <list>. Notes: <summary>.


## #P9-097 — Run Voice UI RTL/Arabic Check

**Group:** Group J — Flutter Voice Integration & QA

**Priority:** P0

**Branch:** `phase9/P9-097-flutter-voice-rtl-arabic-check`

**Dependency:** P9-084..P9-095

**Output:** `docs/quality/phase-9-voice-rtl-arabic-check.md`


### Description
Run Voice UI RTL/Arabic Check for Phase 9 Voice Mode. This task belongs to Group J — Flutter Voice Integration & QA and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Run Voice UI RTL/Arabic Check with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-097.
- Use branch `phase9/P9-097-flutter-voice-rtl-arabic-check`.
- Produce output: `docs/quality/phase-9-voice-rtl-arabic-check.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `docs/quality/phase-9-voice-rtl-arabic-check.md`.
- Implementation follows `phase9/P9-097-flutter-voice-rtl-arabic-check` scope and task P9-097 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-097 — Run Voice UI RTL/Arabic Check for AIM Phase 9 Voice Mode. Use branch `phase9/P9-097-flutter-voice-rtl-arabic-check` and create/update `docs/quality/phase-9-voice-rtl-arabic-check.md`. Dependency: P9-084..P9-095. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-097 complete. Branch: phase9/P9-097-flutter-voice-rtl-arabic-check. Output: docs/quality/phase-9-voice-rtl-arabic-check.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-098 — Run Voice UI Accessibility Check

**Group:** Group J — Flutter Voice Integration & QA

**Priority:** P1

**Branch:** `phase9/P9-098-flutter-voice-accessibility-check`

**Dependency:** P9-084..P9-095

**Output:** `docs/quality/phase-9-voice-accessibility-check.md`


### Description
Run Voice UI Accessibility Check for Phase 9 Voice Mode. This task belongs to Group J — Flutter Voice Integration & QA and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Run Voice UI Accessibility Check with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-098.
- Use branch `phase9/P9-098-flutter-voice-accessibility-check`.
- Produce output: `docs/quality/phase-9-voice-accessibility-check.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `docs/quality/phase-9-voice-accessibility-check.md`.
- Implementation follows `phase9/P9-098-flutter-voice-accessibility-check` scope and task P9-098 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-098 — Run Voice UI Accessibility Check for AIM Phase 9 Voice Mode. Use branch `phase9/P9-098-flutter-voice-accessibility-check` and create/update `docs/quality/phase-9-voice-accessibility-check.md`. Dependency: P9-084..P9-095. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-098 complete. Branch: phase9/P9-098-flutter-voice-accessibility-check. Output: docs/quality/phase-9-voice-accessibility-check.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-099 — Add Flutter Voice UI Tests

**Group:** Group J — Flutter Voice Integration & QA

**Priority:** P1

**Branch:** `phase9/P9-099-flutter-voice-tests`

**Dependency:** P9-078..P9-098

**Output:** `Flutter voice UI tests`


### Description
Add Flutter Voice UI Tests for Phase 9 Voice Mode. This task belongs to Group J — Flutter Voice Integration & QA and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Add Flutter Voice UI Tests with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-099.
- Use branch `phase9/P9-099-flutter-voice-tests`.
- Produce output: `Flutter voice UI tests`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `Flutter voice UI tests`.
- Implementation follows `phase9/P9-099-flutter-voice-tests` scope and task P9-099 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-099 — Add Flutter Voice UI Tests for AIM Phase 9 Voice Mode. Use branch `phase9/P9-099-flutter-voice-tests` and create/update `Flutter voice UI tests`. Dependency: P9-078..P9-098. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-099 complete. Branch: phase9/P9-099-flutter-voice-tests. Output: Flutter voice UI tests. Checks/tests run: <list>. Notes: <summary>.


## #P9-100 — Review Voice UI Design System Usage

**Group:** Group J — Flutter Voice Integration & QA

**Priority:** P0

**Branch:** `phase9/P9-100-flutter-voice-design-system-review`

**Dependency:** P9-083..P9-099

**Output:** `docs/quality/phase-9-voice-design-system-review.md`


### Description
Review Voice UI Design System Usage for Phase 9 Voice Mode. This task belongs to Group J — Flutter Voice Integration & QA and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Review Voice UI Design System Usage with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation. UI must use the AIM Mobile Design System and respect RTL/Arabic behavior.


### Requirements
- Work only on task P9-100.
- Use branch `phase9/P9-100-flutter-voice-design-system-review`.
- Produce output: `docs/quality/phase-9-voice-design-system-review.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Use AIM Mobile Design System for colors, typography, spacing, radius, buttons, cards, inputs, loading/error states, and voice UI widgets.
- Respect RTL/Arabic rules; do not ignore Arabic layout, text alignment, or icon direction.


### Done Test
- Output exists and matches `docs/quality/phase-9-voice-design-system-review.md`.
- Implementation follows `phase9/P9-100-flutter-voice-design-system-review` scope and task P9-100 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.
- UI uses AIM Mobile Design System and passes RTL/Arabic review for the touched screens/widgets.


### AgentPrompt
Implement P9-100 — Review Voice UI Design System Usage for AIM Phase 9 Voice Mode. Use branch `phase9/P9-100-flutter-voice-design-system-review` and create/update `docs/quality/phase-9-voice-design-system-review.md`. Dependency: P9-083..P9-099. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. For UI, use AIM Mobile Design System tokens/widgets and preserve RTL/Arabic behavior. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-100 complete. Branch: phase9/P9-100-flutter-voice-design-system-review. Output: docs/quality/phase-9-voice-design-system-review.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-101 — Run Voice End-to-End Check

**Group:** Group K — Phase 9 Final Safety, QA & Handoff

**Priority:** P0

**Branch:** `phase9/P9-101-voice-end-to-end-check`

**Dependency:** P9-076, P9-099

**Output:** `docs/quality/phase-9-voice-e2e-check.md`


### Description
Run Voice End-to-End Check for Phase 9 Voice Mode. This task belongs to Group K — Phase 9 Final Safety, QA & Handoff and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Run Voice End-to-End Check with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-101.
- Use branch `phase9/P9-101-voice-end-to-end-check`.
- Produce output: `docs/quality/phase-9-voice-e2e-check.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/quality/phase-9-voice-e2e-check.md`.
- Implementation follows `phase9/P9-101-voice-end-to-end-check` scope and task P9-101 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-101 — Run Voice End-to-End Check for AIM Phase 9 Voice Mode. Use branch `phase9/P9-101-voice-end-to-end-check` and create/update `docs/quality/phase-9-voice-e2e-check.md`. Dependency: P9-076, P9-099. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-101 complete. Branch: phase9/P9-101-voice-end-to-end-check. Output: docs/quality/phase-9-voice-e2e-check.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-102 — Run Phase 9 Voice Security Review

**Group:** Group K — Phase 9 Final Safety, QA & Handoff

**Priority:** P0

**Branch:** `phase9/P9-102-voice-security-review`

**Dependency:** P9-101

**Output:** `docs/quality/phase-9-security-review.md`


### Description
Run Phase 9 Voice Security Review for Phase 9 Voice Mode. This task belongs to Group K — Phase 9 Final Safety, QA & Handoff and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Run Phase 9 Voice Security Review with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-102.
- Use branch `phase9/P9-102-voice-security-review`.
- Produce output: `docs/quality/phase-9-security-review.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/quality/phase-9-security-review.md`.
- Implementation follows `phase9/P9-102-voice-security-review` scope and task P9-102 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-102 — Run Phase 9 Voice Security Review for AIM Phase 9 Voice Mode. Use branch `phase9/P9-102-voice-security-review` and create/update `docs/quality/phase-9-security-review.md`. Dependency: P9-101. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-102 complete. Branch: phase9/P9-102-voice-security-review. Output: docs/quality/phase-9-security-review.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-103 — Run Phase 9 Voice Privacy Review

**Group:** Group K — Phase 9 Final Safety, QA & Handoff

**Priority:** P0

**Branch:** `phase9/P9-103-voice-privacy-review`

**Dependency:** P9-101

**Output:** `docs/quality/phase-9-privacy-review.md`


### Description
Run Phase 9 Voice Privacy Review for Phase 9 Voice Mode. This task belongs to Group K — Phase 9 Final Safety, QA & Handoff and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Run Phase 9 Voice Privacy Review with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-103.
- Use branch `phase9/P9-103-voice-privacy-review`.
- Produce output: `docs/quality/phase-9-privacy-review.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/quality/phase-9-privacy-review.md`.
- Implementation follows `phase9/P9-103-voice-privacy-review` scope and task P9-103 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-103 — Run Phase 9 Voice Privacy Review for AIM Phase 9 Voice Mode. Use branch `phase9/P9-103-voice-privacy-review` and create/update `docs/quality/phase-9-privacy-review.md`. Dependency: P9-101. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-103 complete. Branch: phase9/P9-103-voice-privacy-review. Output: docs/quality/phase-9-privacy-review.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-104 — Run Phase 9 Voice Safety Review

**Group:** Group K — Phase 9 Final Safety, QA & Handoff

**Priority:** P0

**Branch:** `phase9/P9-104-voice-safety-review`

**Dependency:** P9-101

**Output:** `docs/quality/phase-9-safety-review.md`


### Description
Run Phase 9 Voice Safety Review for Phase 9 Voice Mode. This task belongs to Group K — Phase 9 Final Safety, QA & Handoff and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Run Phase 9 Voice Safety Review with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-104.
- Use branch `phase9/P9-104-voice-safety-review`.
- Produce output: `docs/quality/phase-9-safety-review.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/quality/phase-9-safety-review.md`.
- Implementation follows `phase9/P9-104-voice-safety-review` scope and task P9-104 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-104 — Run Phase 9 Voice Safety Review for AIM Phase 9 Voice Mode. Use branch `phase9/P9-104-voice-safety-review` and create/update `docs/quality/phase-9-safety-review.md`. Dependency: P9-101. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-104 complete. Branch: phase9/P9-104-voice-safety-review. Output: docs/quality/phase-9-safety-review.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-105 — Run No Client Provider Final Review

**Group:** Group K — Phase 9 Final Safety, QA & Handoff

**Priority:** P0

**Branch:** `phase9/P9-105-no-client-provider-final-review`

**Dependency:** P9-096, P9-101

**Output:** `docs/quality/phase-9-no-client-provider-review.md`


### Description
Run No Client Provider Final Review for Phase 9 Voice Mode. This task belongs to Group K — Phase 9 Final Safety, QA & Handoff and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Run No Client Provider Final Review with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-105.
- Use branch `phase9/P9-105-no-client-provider-final-review`.
- Produce output: `docs/quality/phase-9-no-client-provider-review.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/quality/phase-9-no-client-provider-review.md`.
- Implementation follows `phase9/P9-105-no-client-provider-final-review` scope and task P9-105 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-105 — Run No Client Provider Final Review for AIM Phase 9 Voice Mode. Use branch `phase9/P9-105-no-client-provider-final-review` and create/update `docs/quality/phase-9-no-client-provider-review.md`. Dependency: P9-096, P9-101. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-105 complete. Branch: phase9/P9-105-no-client-provider-final-review. Output: docs/quality/phase-9-no-client-provider-review.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-106 — Run No AIM Authority Final Review

**Group:** Group K — Phase 9 Final Safety, QA & Handoff

**Priority:** P0

**Branch:** `phase9/P9-106-no-aim-authority-final-review`

**Dependency:** P9-005, P9-101

**Output:** `docs/quality/phase-9-no-aim-authority-review.md`


### Description
Run No AIM Authority Final Review for Phase 9 Voice Mode. This task belongs to Group K — Phase 9 Final Safety, QA & Handoff and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Run No AIM Authority Final Review with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-106.
- Use branch `phase9/P9-106-no-aim-authority-final-review`.
- Produce output: `docs/quality/phase-9-no-aim-authority-review.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/quality/phase-9-no-aim-authority-review.md`.
- Implementation follows `phase9/P9-106-no-aim-authority-final-review` scope and task P9-106 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-106 — Run No AIM Authority Final Review for AIM Phase 9 Voice Mode. Use branch `phase9/P9-106-no-aim-authority-final-review` and create/update `docs/quality/phase-9-no-aim-authority-review.md`. Dependency: P9-005, P9-101. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-106 complete. Branch: phase9/P9-106-no-aim-authority-final-review. Output: docs/quality/phase-9-no-aim-authority-review.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-107 — Create Voice Cost Control Notes

**Group:** Group K — Phase 9 Final Safety, QA & Handoff

**Priority:** P1

**Branch:** `phase9/P9-107-voice-cost-control-notes`

**Dependency:** P9-101

**Output:** `docs/phase-9/voice-cost-control-notes.md`


### Description
Create Voice Cost Control Notes for Phase 9 Voice Mode. This task belongs to Group K — Phase 9 Final Safety, QA & Handoff and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Voice Cost Control Notes with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-107.
- Use branch `phase9/P9-107-voice-cost-control-notes`.
- Produce output: `docs/phase-9/voice-cost-control-notes.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/voice-cost-control-notes.md`.
- Implementation follows `phase9/P9-107-voice-cost-control-notes` scope and task P9-107 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-107 — Create Voice Cost Control Notes for AIM Phase 9 Voice Mode. Use branch `phase9/P9-107-voice-cost-control-notes` and create/update `docs/phase-9/voice-cost-control-notes.md`. Dependency: P9-101. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-107 complete. Branch: phase9/P9-107-voice-cost-control-notes. Output: docs/phase-9/voice-cost-control-notes.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-108 — Review Phase 9 Output Completeness

**Group:** Group K — Phase 9 Final Safety, QA & Handoff

**Priority:** P0

**Branch:** `phase9/P9-108-phase-9-output-completeness-review`

**Dependency:** P9-102..P9-107

**Output:** `docs/quality/phase-9-output-completeness-review.md`


### Description
Review Phase 9 Output Completeness for Phase 9 Voice Mode. This task belongs to Group K — Phase 9 Final Safety, QA & Handoff and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Review Phase 9 Output Completeness with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-108.
- Use branch `phase9/P9-108-phase-9-output-completeness-review`.
- Produce output: `docs/quality/phase-9-output-completeness-review.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/quality/phase-9-output-completeness-review.md`.
- Implementation follows `phase9/P9-108-phase-9-output-completeness-review` scope and task P9-108 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-108 — Review Phase 9 Output Completeness for AIM Phase 9 Voice Mode. Use branch `phase9/P9-108-phase-9-output-completeness-review` and create/update `docs/quality/phase-9-output-completeness-review.md`. Dependency: P9-102..P9-107. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-108 complete. Branch: phase9/P9-108-phase-9-output-completeness-review. Output: docs/quality/phase-9-output-completeness-review.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-109 — Create Phase 10 Readiness Checklist

**Group:** Group K — Phase 9 Final Safety, QA & Handoff

**Priority:** P1

**Branch:** `phase9/P9-109-phase-10-readiness-checklist`

**Dependency:** P9-108

**Output:** `docs/phase-10/readiness-checklist.md`


### Description
Create Phase 10 Readiness Checklist for Phase 9 Voice Mode. This task belongs to Group K — Phase 9 Final Safety, QA & Handoff and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Phase 10 Readiness Checklist with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-109.
- Use branch `phase9/P9-109-phase-10-readiness-checklist`.
- Produce output: `docs/phase-10/readiness-checklist.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-10/readiness-checklist.md`.
- Implementation follows `phase9/P9-109-phase-10-readiness-checklist` scope and task P9-109 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-109 — Create Phase 10 Readiness Checklist for AIM Phase 9 Voice Mode. Use branch `phase9/P9-109-phase-10-readiness-checklist` and create/update `docs/phase-10/readiness-checklist.md`. Dependency: P9-108. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-109 complete. Branch: phase9/P9-109-phase-10-readiness-checklist. Output: docs/phase-10/readiness-checklist.md. Checks/tests run: <list>. Notes: <summary>.


## #P9-110 — Create Phase 9 Final Review and Handoff

**Group:** Group K — Phase 9 Final Safety, QA & Handoff

**Priority:** P0

**Branch:** `phase9/P9-110-phase-9-final-review`

**Dependency:** P9-109

**Output:** `docs/phase-9/final-review.md`


### Description
Create Phase 9 Final Review and Handoff for Phase 9 Voice Mode. This task belongs to Group K — Phase 9 Final Safety, QA & Handoff and must preserve backend authority over voice, STT, TTS, AI, and AIM decisions.


### Goal
Complete Create Phase 9 Final Review and Handoff with production-ready structure, tests or documentation as appropriate, and no client-side provider or AIM authority violation.


### Requirements
- Work only on task P9-110.
- Use branch `phase9/P9-110-phase-9-final-review`.
- Produce output: `docs/phase-9/final-review.md`.
- Preserve backend authority: Flutter must not call STT, TTS, AI providers, or AIM Engine directly.
- Do not calculate mastery, weakness, difficulty, recommendations, review schedule, or student level on the client.
- Do not commit secrets, API keys, provider credentials, audio tokens, or generated private audio files.
- Backend/doc tasks must keep voice provider access behind backend services and validate permissions/ownership where relevant.


### Done Test
- Output exists and matches `docs/phase-9/final-review.md`.
- Implementation follows `phase9/P9-110-phase-9-final-review` scope and task P9-110 only.
- No secrets are committed.
- No Flutter direct provider calls exist.
- AIM Engine remains the source of learning decisions.


### AgentPrompt
Implement P9-110 — Create Phase 9 Final Review and Handoff for AIM Phase 9 Voice Mode. Use branch `phase9/P9-110-phase-9-final-review` and create/update `docs/phase-9/final-review.md`. Dependency: P9-109. Keep all STT/TTS/AI provider access backend-side only; Flutter must not call providers directly. Do not change AIM authority: mastery, weakness, difficulty, recommendations, and review schedule remain backend/AIM-controlled. Run relevant checks/tests and document results before marking Done.


### Completion Comment Template
P9-110 complete. Branch: phase9/P9-110-phase-9-final-review. Output: docs/phase-9/final-review.md. Checks/tests run: <list>. Notes: <summary>.
