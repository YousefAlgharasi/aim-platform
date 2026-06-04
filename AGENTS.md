# AGENTS.md

> **Project:** AIM — Adaptive Intelligence Module  
> **Repository:** `YousefAlgharasi/AimAlgorthim`  
> **Primary Agent:** Codex  
> **Scope:** AIM Algorithm Completion First, then Web Cloud Pilot  
> **Last Updated:** 2026-06-03  

---

## Table of Contents

1. [Project Context](#1-project-context)
2. [Current Execution Scope](#2-current-execution-scope)
3. [Repository Architecture Rules](#3-repository-architecture-rules)
4. [Critical Algorithm Rules](#4-critical-algorithm-rules)
5. [Approved Mastery Formula](#5-approved-mastery-formula)
6. [Difficulty Adaptation Rules](#6-difficulty-adaptation-rules)
7. [Decision Priority Rules](#7-decision-priority-rules)
8. [Notion Task Workflow](#8-notion-task-workflow)
9. [Notion Status Rules](#9-notion-status-rules)
10. [Task Selection Rules](#10-task-selection-rules)
11. [Per-Task Execution Process](#11-per-task-execution-process)
12. [Git Branch Rules](#12-git-branch-rules)
13. [Testing Rules](#13-testing-rules)
14. [Algorithm Completion Target](#14-algorithm-completion-target)
15. [Final Session Pipeline Target](#15-final-session-pipeline-target)
16. [Expected Adaptive API Response](#16-expected-adaptive-api-response)
17. [Educational Safety Rules](#17-educational-safety-rules)
18. [Cloud Web Pilot Target](#18-cloud-web-pilot-target)
19. [Required Report Format](#19-required-report-format)
20. [If Notion Access Is Not Available](#20-if-notion-access-is-not-available)
21. [First Task: AIM-001](#21-first-task-aim-001)
22. [Startup Prompt for Codex](#22-startup-prompt-for-codex)

---

## 1. Project Context

You are working on the **AIM Project**, an intelligent English learning platform powered by the:

```text
AIM Adaptive Intelligence Module
```

The current repository is:

```text
YousefAlgharasi/AimAlgorthim
```

Your role is to act as a senior:

- Backend Engineer
- Python Engineer
- FastAPI Engineer
- Algorithm Integration Engineer
- Test-focused Software Engineer

You must execute tasks carefully and incrementally.

> **Important:** Do not rebuild the project from scratch. Extend and stabilize the existing implementation.

---

## 2. Current Execution Scope

The current priority is:

```text
Complete and validate the AIM algorithm first.
```

The first real pilot will be a **web/cloud pilot**, not Flutter.

The pilot platform will use:

| Layer | Technology |
|---|---|
| Frontend | React Web |
| Backend | FastAPI |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth / JWT |
| Pilot Users | 5 Arabic-speaking A1 English learners |
| Duration | 2 weeks |

Flutter is **not** part of the first pilot.

Flutter will come later after the algorithm is validated.

---

## 3. Repository Architecture Rules

Preserve the current backend structure:

```text
src/aim/domain/services
src/aim/application/use_cases
src/aim/infrastructure
src/aim/presentation/api
```

### Rules

- Do not move major modules unless a task explicitly requires it.
- Do not rewrite the whole architecture.
- Keep AIM algorithm logic in the backend/Python layer.
- Frontend must only consume API outputs.
- Keep changes small, safe, and testable.

### Approved Backend Stack

| Concern | Tool |
|---|---|
| API | FastAPI |
| ORM / Persistence | SQLAlchemy |
| Migrations | Alembic |
| Cloud DB | Supabase PostgreSQL |
| Local DB | SQLite only if already supported for testing |

---

## 4. Critical Algorithm Rules

### 4.1 Speed Must Not Affect Mastery

Response time and speed must **never** affect:

- Mastery score
- Student level
- Direct difficulty increase

The following values are forbidden inside mastery calculation:

```text
response_time
avg_response_time
speed_score
```

### 4.2 Allowed Use of Speed

Speed may be used only as behavioral evidence for:

```text
hesitation
rushing
fatigue_or_distraction_signal
possible_guessing
low_confidence_signal
session_behavior_analysis
```

### 4.3 Forbidden Use of Speed

Do not use speed in:

```text
mastery calculator
student level calculator
mastery formula
direct difficulty increase logic
```

---

## 5. Approved Mastery Formula

Use this no-speed mastery formula:

```text
mastery_raw =
  accuracy_score * 0.40 +
  consistency_score * 0.20 +
  retention_score * 0.15 +
  difficulty_performance_score * 0.20 +
  evidence_quality_score * 0.05

mastery_adjusted =
  mastery_raw - hint_penalty - retry_penalty - skip_penalty

reliability = min(1.0, valid_attempt_count / 10)

final_mastery =
  previous_mastery * (1 - reliability)
  + mastery_adjusted * reliability

final_mastery must not increase by more than 12 points per session.
final_mastery must not decrease by more than 15 points per session.
Clamp final_mastery between 0 and 100.
```

### Mastery Formula Checklist

Before marking mastery-related work as complete, verify:

- [ ] No response time is used in mastery.
- [ ] No speed score is used in mastery.
- [ ] Accuracy is included.
- [ ] Consistency is included.
- [ ] Retention is included.
- [ ] Difficulty performance is included.
- [ ] Evidence quality is included.
- [ ] Hint penalty is applied.
- [ ] Retry penalty is applied.
- [ ] Skip penalty is applied.
- [ ] Reliability is applied.
- [ ] Session increase/decrease caps are applied.
- [ ] Final mastery is clamped between 0 and 100.

---

## 6. Difficulty Adaptation Rules

Difficulty may increase only if **all** of the following are true:

| Metric | Required Condition |
|---|---|
| mastery | `>= 85` |
| consistency | `>= 75` |
| reliability | `>= 0.70` |
| weakness_score | `< 50` |
| frustration_score | `< 60` |
| retention | `>= 70` |

Difficulty should decrease when one or more of the following is true:

- Frustration is high.
- Weakness is high.
- Repeated failure exists.
- Mastery is low with acceptable reliability.

### Difficulty Safety Rules

- Do not increase difficulty when reliability is low.
- Do not increase difficulty when frustration is high.
- Do not increase difficulty when prerequisite gaps are severe.
- Do not increase difficulty based on speed.

---

## 7. Decision Priority Rules

The final adaptive decision must follow this priority order:

| Priority | Decision Case |
|---:|---|
| 1 | low_reliability / collect_more_evidence |
| 2 | high_frustration_or_overload |
| 3 | severe_prerequisite_gap |
| 4 | severe_weakness |
| 5 | strong_error_pattern |
| 6 | retention_review |
| 7 | confidence_mismatch |
| 8 | difficulty_adaptation |
| 9 | transfer_acceleration |
| 10 | continue_current_skill |

### Final Decision Authority

The `DecisionConflictResolver` is the final authority.

This must **never** happen:

```text
DecisionConflictResolver selected_action = collect_more_evidence
RecommendationEngine action = increase_difficulty
```

This must **always** be true:

```text
recommendation.action == decision_conflict.selected_action
```

---

## 8. Notion Task Workflow

The Notion task database is the source of truth for execution.

### Notion Database

```text
AIM Algorithm - Web Cloud Pilot Tasks
```

### Notion URL

```text
https://www.notion.so/fed5258911354fac8a4deb270c9e5e91
```

### Current Focus

For now, work only on algorithm tasks:

```text
AIM-001 to AIM-010
```

Do **not** work on these phases until algorithm tasks are complete unless the user explicitly asks:

- Cloud Backend
- React Frontend
- A1 Content
- Pilot Study
- Analysis & Production

---

## 9. Notion Status Rules

Every task has a Notion status property named:

```text
الحالة
```

Allowed statuses:

| Status | Use When |
|---|---|
| Not Started | No meaningful work has started |
| In Progress | Work has started but is not complete |
| Review | Implementation is complete and needs human review |
| Blocked | Work cannot continue because of a dependency, access, setup, or safety issue |
| Done | Implementation is complete, tests pass, and acceptance criteria are met |

### Status Requirements

- Set a task to `In Progress` before starting meaningful work.
- Set a task to `Done` only when all acceptance criteria pass.
- Set a task to `Blocked` only with a clear reason.
- Never mark a failing task as `Done`.

---

## 10. Task Selection Rules

Before starting work:

1. Open the Notion database.
2. Sort tasks by:

```text
ترتيب التنفيذ
```

ascending.

3. Find the first task whose status is not `Done`.
4. If it is `Not Started`, set it to `In Progress`.
5. If it is `In Progress`, continue from it.
6. If it is `Blocked`, report the blocker.
7. Do not skip dependencies.

### Current Algorithm Task Order

```text
AIM-001
AIM-002
AIM-003
AIM-004
AIM-005
AIM-006
AIM-007
AIM-008
AIM-009
AIM-010
```

Only after these are complete, continue to:

```text
AIM-011+
```

---

## 11. Per-Task Execution Process

For each task:

1. Read the full Notion row.
2. Check the following fields:
   - Task ID
   - Task title
   - Phase
   - System Affected
   - Dependencies
   - Required outputs
   - Acceptance criteria
   - Git Branch
   - Test Command
   - Codex Prompt
3. Verify dependencies are `Done`.
4. Set the current task status to `In Progress`.
5. Create or switch to the required branch.
6. Inspect existing code before editing.
7. Make the smallest safe implementation.
8. Add or update tests.
9. Run the required test command.
10. If tests pass and acceptance criteria are met, set status to `Done`.
11. If implementation is complete but needs human review, set status to `Review`.
12. If blocked, set status to `Blocked` and report why.
13. Write the final task report.

---

## 12. Git Branch Rules

Use the branch written in the Notion task when available.

### Main Algorithm Branch

```text
feature/complete-aim-25-systems
```

### Cloud Backend Branch Examples

```text
feature/cloud-supabase-postgres
feature/supabase-auth-fastapi
feature/aim-web-api
```

### React Branch Examples

```text
feature/react-web-pilot
feature/react-supabase-auth
feature/react-lesson-session
```

### Content Branch

```text
feature/a1-pilot-content
```

---

## 13. Testing Rules

### Backend Tests

Run before and after important backend changes:

```bash
PYTHONPATH=src pytest
```

### React Build

Run after React changes:

```bash
npm run build
```

### Database Migration Test

Run after Alembic migration changes:

```bash
alembic upgrade head
```

### Speed Leakage Check

Run after algorithm changes:

```bash
grep -R "response_time\|avg_response_time\|speed_score" src/aim/domain src/aim/application
```

### Allowed Speed Locations

```text
performance analyzer
emotional/behavioral detector
hesitation/rushing/guessing logic
learning response pattern detector
session behavior analysis
```

### Forbidden Speed Locations

```text
mastery calculator
student level calculator
mastery formula
direct difficulty increase logic
```

---

## 14. Algorithm Completion Target

Current state:

| Category | Count |
|---|---:|
| Total systems | 25 |
| Ready systems | 20 |
| Partial systems | 5 |
| Missing systems | 0 |

The five partial systems that must be completed are:

1. Error Pattern Classifier
2. Question Quality Analyzer
3. Transfer Learning Detector integration
4. Decision Conflict Resolver integration
5. Outcome Tracker integration

Target state:

| Category | Count |
|---|---:|
| Total systems | 25 |
| Ready systems | 25 |
| Partial systems | 0 |
| Missing systems | 0 |

---

## 15. Final Session Pipeline Target

`SessionUseCases.record_attempts` must eventually run this full pipeline:

1. Validate input attempts.
2. Save attempts.
3. Analyze performance.
4. Load historical question quality stats.
5. Analyze question quality.
6. Calculate evidence quality.
7. Calculate reliability.
8. Calculate mastery without speed.
9. Stabilize mastery update.
10. Update student skill state.
11. Detect weaknesses.
12. Classify expanded error patterns.
13. Detect safe emotional signals.
14. Update retention.
15. Detect learning response pattern.
16. Detect prerequisite gaps.
17. Detect transfer learning if enough data exists.
18. Run fairness audit.
19. Resolve decision conflicts.
20. Generate final recommendation from resolved conflict.
21. Generate prompt adaptation.
22. Track outcome of previous recommendation.
23. Save explanation/audit logs.
24. Commit transaction.
25. Return full adaptive result to API.

---

## 16. Expected Adaptive API Response

The adaptive API response must include:

```text
updated_skill_state
performance_metrics
mastery_result
weakness_result
error_pattern
safe_emotional_signal
retention_result
evidence_quality
reliability
question_quality
learning_response_pattern
prerequisite_gaps
transfer_learning
fairness_audit
decision_conflict
difficulty_decision
recommendation
prompt_adaptation_instruction
outcome_tracking
explanation_log_id if available
```

---

## 17. Educational Safety Rules

Do not use medical or clinical terms.

Do not psychologically diagnose the student.

Use educational and behavioral terms only.

### Allowed Terms

```text
low confidence signal
possible guessing
rushing
hesitation
high frustration signal
prerequisite gap
weak retention
concept misunderstanding
```

### Forbidden Terms

```text
medical diagnosis
clinical psychological labels
mental health claims
```

---

## 18. Cloud Web Pilot Target

After algorithm completion, prepare the system for a cloud web pilot.

### Backend

```text
FastAPI
Supabase PostgreSQL
SQLAlchemy
Alembic
Supabase Auth JWT verification
Cloud-ready env config
```

### Frontend

```text
React Web
student login/register
dashboard
lesson page
quiz/session page
adaptive result page
admin/debug dashboard
```

### Content

```text
A1 English lessons
Arabic-speaking learners
6 to 10 short lessons
pre-test
post-test
question metadata
```

Every question must include metadata such as:

```text
skill_id
concept
difficulty
prerequisites
common_error_tags
correct answer
choices
explanation
```

### Pilot

```text
5 real students
A1 level
Arabic speakers learning English
real login
2 weeks
no control group
measure learning gain and recommendation effectiveness
```

---

## 19. Required Report Format

After finishing each task, respond using this exact format:

```text
Task ID:
Task title:
Notion status before:
Notion status after:
Branch:
Files inspected:
Files changed:
Implementation summary:
Tests run:
Test result:
Acceptance criteria status:
Risks / notes:
Next recommended task:
```

Do not move to the next task unless the current task is complete or clearly blocked.

---

## 20. If Notion Access Is Not Available

If Notion access is not available:

1. Do not guess task status.
2. Ask the user to provide the current task row or export.
3. Continue using the known task order only if the user confirms.
4. At the end, clearly tell the user which Notion status should be updated manually.

Example:

```text
I could not access Notion directly.

Recommended manual update:
AIM-003 -> In Progress

Reason:
Implementation started, but tests are not passing yet.
```

---

## 21. First Task: AIM-001

Start with:

```text
AIM-001
```

Task title:

```text
تشغيل baseline tests وتوثيق الوضع الحالي
```

### Commands

```bash
git checkout main
git pull
git checkout -b feature/complete-aim-25-systems

PYTHONPATH=src pytest
```

Then inspect speed usage:

```bash
grep -R "response_time\|avg_response_time\|speed_score" src/aim/domain src/aim/application
```

### Required Output

```text
current passing tests
current failing tests
speed-related code locations
risky files
recommended next task
```

### Restriction

Do not modify algorithm logic during `AIM-001`.

Only fix setup/environment issues if they prevent tests from running.

---

## 22. Startup Prompt for Codex

Use this prompt when starting Codex:

```text
Read AGENTS.md first.

Then open the Notion database:

AIM Algorithm - Web Cloud Pilot Tasks
https://www.notion.so/fed5258911354fac8a4deb270c9e5e91

Your job is to work only on the AIM algorithm tasks first.

Start from the first task that is not Done, sorted by "ترتيب التنفيذ".

Rules:

1. If the task is Not Started, change it to In Progress before working.
2. If the task is In Progress, continue from it.
3. If the task is Done, skip it.
4. If the task is Blocked, report why it is blocked.
5. Do not skip dependencies.
6. Work on one task only.
7. After completing the task, update Notion:
   - Done if implementation is complete, tests pass, and acceptance criteria are met.
   - Review if implementation is complete but needs human review.
   - In Progress if work started but is not complete.
   - Blocked if you cannot continue because of a missing dependency, missing access, or setup issue.
   - Not Started only if you did not begin the task.

For now, focus only on the algorithm tasks:

AIM-001 to AIM-010

Do not work on Cloud Backend, React Frontend, A1 Content, Pilot Study, or Analysis tasks yet.

Start with AIM-001 unless Notion shows another algorithm task already In Progress.

For AIM-001:

- Do not edit the algorithm.
- Run baseline tests.
- Inspect speed usage.
- Report current passing/failing tests.
- Report risky files.
- Report the next recommended task.

Commands:

git checkout main
git pull
git checkout -b feature/complete-aim-25-systems

PYTHONPATH=src pytest

grep -R "response_time\|avg_response_time\|speed_score" src/aim/domain src/aim/application

After finishing, update the Notion task status correctly and respond using this format:

Task ID:
Task title:
Notion status before:
Notion status after:
Branch:
Files inspected:
Files changed:
Implementation summary:
Tests run:
Test result:
Acceptance criteria status:
Risks / notes:
Next recommended task:
```
