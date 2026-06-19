# Phase 9 — Task Execution Rules

**Phase:** 9
**Task:** P9-002
**Branch:** `phase9/P9-002-phase-9-task-rules`
**Dependency:** P9-001 (Phase 9 Voice Mode Charter — Done)
**Output:** `docs/phase-9/task-execution-rules.md`

---

## 1. Purpose

This document defines how agents claim, execute, validate, and close
Phase 9 tasks. Every contributor must follow these rules precisely.
Deviation is a stop condition.

---

## 2. Task Lifecycle

### Step 1 — Pick a Task

- Open the Phase 9 Notion Tasks database.
- Select one task where **Status = Undone** and **Assigned is empty**.
- Do not pick a task that is already assigned, In Progress, Done, or
  Blocked.
- Work one task at a time. Do not batch tasks.

### Step 2 — Verify Dependencies

- Read the task's **Dependency** field.
- For each listed dependency, confirm its Status = Done in Notion.
- If any dependency is not Done: **stop**. Do not proceed. Do not set
  the task to In Progress.
- If a dependency's output file is declared, confirm the file exists in
  the repository.

### Step 3 — Verify the Prompt Section

- Open `docs/tasks/phase9_prompts.md`.
- Confirm a section matching `#<TASK-ID>` exists.
- If the section is missing: **stop**. Do not improvise the task.

### Step 4 — Claim the Task

- Set **Assigned** to yourself in Notion.
- Set **Status** = `In Progress` in Notion.
- Both updates must happen before any code or file work begins.

### Step 5 — Use the Exact Branch

- Check out the branch name listed in the task's **Branch** field
  exactly as written.
- Do not rename, abbreviate, or alter the branch name.
- Branch from `main` (or the current default branch).

### Step 6 — Execute Against the Prompt

- Follow only the instructions in the `#<TASK-ID>` section of
  `docs/tasks/phase9_prompts.md`.
- Do not do unrelated cleanup, refactoring, or work from other tasks.
- Produce only the declared **Output** file(s).
- Do not implement AI Teacher or voice logic that overrides AIM Engine
  authority.
- Do not call any STT provider, TTS provider, or AI provider directly
  from Flutter.
- Do not call the AIM Engine directly from Flutter.

### Step 7 — Commit File-by-File

- Stage and commit each output file individually.
- Commit message format: `<TASK-ID>: <short description>`
- Example: `P9-002: create phase 9 task execution rules`
- Do not bundle unrelated files in a single commit.
- Do not commit secrets, credentials, API keys, tokens, or generated
  private audio files.

### Step 8 — Run Done Test

Before pushing, verify all Done Test conditions from the prompt:

- [ ] Expected output file(s) exist at the declared path.
- [ ] Task is limited to the declared output only.
- [ ] UI tasks: all UI uses the AIM Mobile Design System tokens and
      widgets.
- [ ] UI tasks: RTL/Arabic layout is verified on every screen.
- [ ] AIM Engine remains the sole authority for mastery, level,
      weakness, difficulty, recommendations, and review schedule.
- [ ] Flutter does not call any STT, TTS, or AI provider directly.
- [ ] Flutter does not call the AIM Engine directly.
- [ ] No secrets and no generated private audio files are committed.
- [ ] Checks are run (if applicable) or documented as N/A.

### Step 9 — Push the Branch

- Push to `origin/<branch-name>`.
- Confirm the push succeeds.
- If push fails: investigate, fix, and retry. Do not mark Done on a
  failed push.

### Step 10 — Add Completion Comment

- In Notion, insert a completion comment on the task page using the
  task's Completion Comment Template, with:
  - Files created or modified.
  - Branch name.
  - Commit hash(es).
  - Done Test results.
  - Phase 9 validation results (STT/TTS/AI provider access, AIM Engine
    authority, client-side learning authority, design system usage).

### Step 11 — Mark Done

- Set **Status** = `Done` in Notion.
- This is the final step. Do not set Done before the push succeeds.

---

## 3. Stop Conditions

Stop immediately and do not proceed if any of the following are true:

| Condition | Action |
|---|---|
| Task is already Assigned | Stop. Pick a different task. |
| Task Status is not Undone | Stop. Pick a different task. |
| A dependency is not Done | Stop. Wait for dependency. |
| A dependency output file is missing | Stop. Escalate. |
| The prompt section is missing in `phase9_prompts.md` | Stop. Do not improvise. |
| Secrets or credentials are found in task inputs | Stop. Do not commit. |
| Provider credentials are required but unavailable | Stop. Mark Blocked. |
| The task would cause Flutter to call an STT, TTS, or AI provider directly | Stop. Redesign to a backend call. |
| The task would cause Flutter to call the AIM Engine directly | Stop. Redesign to a backend call. |
| The task would let AI Teacher override AIM Engine authority | Stop. Keep AI Teacher advisory-only. |
| The task would calculate mastery, level, weakness, difficulty, recommendations, or review schedule in AI Teacher or Flutter | Stop. Move logic to AIM Engine. |
| UI work ignores the AIM Mobile Design System | Stop. Use design system. |
| UI work ignores RTL/Arabic rules | Stop. Fix layout. |
| Secrets or generated private audio files would be committed | Stop. Exclude them. |
| The working tree has unrelated changes | Stop. Isolate changes to this task. |
| Push fails | Stop marking Done. Fix and retry. |

---

## 4. Quality Rules

### 4.1 Secrets and Private Audio

- Never commit STT provider API keys, TTS provider API keys, AI
  provider API keys, Supabase service-role keys, database credentials,
  production tokens, or other secrets.
- Never commit generated private audio files (recordings or synthesized
  speech). Store audio references (paths/IDs/URLs to backend-managed
  storage) only, never raw audio in the repository.
- Scan output files before committing for credential-shaped strings
  (e.g. `sk-`, `ghp_`, `AIza`, `Bearer `, connection strings).
- If a secret is found, remove it and use environment variables or
  secure config references instead.

### 4.2 Scope Discipline

- Each task produces exactly its declared output. Nothing more.
- Do not fix unrelated bugs, rename unrelated files, or refactor code
  outside the task scope.
- Do not implement other Phase 9 tasks while working on the current one.
- If a problem outside the task scope is found, log it separately
  instead of fixing it inline.

### 4.3 AIM Engine Authority Boundary

- AIM Engine is the sole authority for mastery, level, weakness,
  difficulty, recommendations, review schedule, and retention.
- AI Teacher (text or voice) may explain, guide, hint, and tutor using
  backend-approved context, but never recomputes or overrides AIM
  Engine decisions.
- If a task appears to require AI Teacher to make a learning decision,
  stop and escalate.

### 4.4 STT/TTS/AI Provider Access Boundary

- All STT provider access happens through the backend-only STT Gateway.
- All TTS provider access happens through the backend-only TTS Gateway.
- All AI provider access happens through the backend-only AI Provider
  Gateway.
- Flutter never calls any STT, TTS, or AI provider directly and never
  holds a provider API key.
- Flutter never calls the AIM Engine directly.
- Backend gateways are the only place provider keys are read, from
  secure configuration/environment, never hard-coded or logged.

### 4.5 Design System Compliance

- All colors must come from the AIM Mobile Design System theme tokens.
- All typography must use the shared text style tokens.
- All spacing must use the shared spacing constants.
- Shared components (buttons, cards, inputs, voice controls, chat
  bubbles, loading and error states, navigation) must use the existing
  widget library from the `design-system` branch.
- Hard-coded style values in feature code are a violation.

### 4.6 RTL/Arabic Compliance

- Use locale-driven direction — never force `TextDirection.ltr` in
  feature code.
- Use direction-aware padding/alignment (e.g. `EdgeInsetsDirectional`,
  `start`/`end` alignment) instead of fixed left/right values.
- Mirror icons that imply direction (back arrows, navigation chevrons,
  microphone/playback control layout, chat bubble tails).
- Verify voice control and chat bubble alignment and text flow for
  Arabic before marking a UI task Done.

---

## 5. Task Execution Summary (Quick Reference)

```
1. Pick → Status=Undone, Assigned=empty
2. Verify → All dependencies Done, output files exist
3. Verify → Prompt section #P9-XXX exists
4. Claim → Set Assigned + Status=In Progress
5. Branch → Use exact branch name from task
6. Execute → Follow prompt, produce declared output only
7. Commit → File-by-file, task ID in message, no secrets/private audio
8. Done Test → All checklist items pass
9. Push → Confirm success
10. Comment → Add completion note to Notion
11. Done → Set Status=Done
```

---

## 6. References

- Phase 9 Charter: `docs/phase-9/voice-mode-charter.md`
- Phase 9 Prompts: `docs/tasks/phase9_prompts.md`
- Phase 8 Task Execution Rules (precedent): `docs/phase-8/task-execution-rules.md`
- Repository: https://github.com/YousefAlgharasi/aim-platform

---

*Task execution rules created: P9-002 | Branch: phase9/P9-002-phase-9-task-rules*
