# Phase 3 Notion Reconciliation Guide

Date: 2026-06-16
Status: Action required — manual reconciliation

---

## Problem

The Notion Phase 3 Tasks database has diverged from the canonical task prompt file at `docs/tasks/phase_3_task_prompts.md`. Task IDs, titles, branches, and AgentPrompt references do not align 1:1 between the two systems.

This causes agents picking tasks from Notion to potentially execute the wrong prompt section.

## Source of Truth

`docs/tasks/phase_3_task_prompts.md` is the canonical source for:
- Task IDs (P3-001..P3-070)
- Task titles
- Branch names
- Expected outputs
- Dependencies
- Done tests

Notion is the operational tracker for:
- Assignment (who is working on what)
- Status (Undone / In Progress / Done)
- Completion comments

## Known Mismatches

### ID/Title Conflicts

| Prompt ID | Prompt Title | Notion ID | Notion Title | Issue |
|---|---|---|---|---|
| P3-054 | Build Admin Chapters UI | P3-054 | Build Admin Skills UI | Title mismatch |
| P3-055 | Build Admin Skills UI | — | — | Not found as P3-055 in Notion |

### Notion Tasks Not in Prompt File

The following Notion tasks exist but have no matching entry in the prompt file:

- Implement Published Content Read API
- Build Admin Content Publish Controls
- Implement Curriculum Feature Module Skeleton
- Build Admin Question Skill Linking UI
- Build Admin Courses and Levels UI (combined)
- Implement Question Choice and Answer Validation
- Add MVP Question Bank Seed
- Create Admin Curriculum Flow Check
- Build Admin Lesson Assets UI

### Branch Name Mismatches

| Prompt Branch | Notion Branch | Issue |
|---|---|---|
| phase3/P3-055-admin-skills-ui | phase3/P3-054-admin-skills-ui | Wrong ID prefix |
| phase3/P3-055-admin-skills-ui | phase3/P3-055-admin-lessons-ui | Wrong feature suffix |

### AgentPrompt Mismatches

Some Notion tasks have `AgentPrompt` fields pointing to wrong task sections. Example:
- Notion "Build Admin Skills UI" (P3-054 in Notion) points to `#P3-054` instead of `#P3-055`.

## Reconciliation Steps

1. Export all Notion Phase 3 tasks with their `userDefined:ID`, `Task`, `Branch`, `AgentPrompt`, and `Status` fields.
2. Compare each Notion row against `docs/tasks/phase_3_task_prompts.md`.
3. For each mismatch:
   - If the Notion ID is wrong: update `userDefined:ID` to match the prompt file.
   - If the Notion title is wrong: update `Task` to match the prompt file.
   - If the Notion branch is wrong: update `Branch` to match the prompt file.
   - If the AgentPrompt is wrong: update to point to the correct `#P3-XXX` section.
4. For Notion tasks that have no prompt file equivalent: mark them as out-of-scope or merge their work into the correct canonical task.
5. For prompt file tasks missing from Notion: create the Notion entry with correct fields.

## Prevention

Going forward:
- The prompt file is created first for every phase.
- Notion tasks are created by importing from the prompt file.
- Any runtime changes to tasks must be reflected back to the prompt file.
- AgentPrompt must always reference the correct `#P3-XXX` anchor.
