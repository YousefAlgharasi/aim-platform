# AIM Phase 10 Task Prompts

Phase 10: Quizzes, Exams, and Deadlines

Repository:
https://github.com/YousefAlgharasi/aim-platform
Notion Database: 
https://app.notion.com/p/383af08baaf68029b748f6bf2648bd32?v=420d3a79b7894c4eb89528118dcaa2b1

Prompt file target path:
docs/tasks/phase_10_task_prompts.md

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Stop Conditions:
- TEAM_MEMBER_NOTION_EMAIL is missing.
- The Notion task is already assigned.
- The task is not Undone.
- A dependency is incomplete.
- A dependency output is missing from GitHub.
- Working tree has unrelated changes.
- This prompt file or the exact task section is missing.
- A real secret is detected.
- Client-side grading, client-side scoring, or client-side deadline authority is introduced.
- Flutter directly writes assessment results, progress, skill states, weaknesses, recommendations, review schedules, or AIM outputs.
- AI Teacher, payments, parent dashboard, voice AI, or admin UI work appears outside explicit scope.

---

#P10-001

Task: Create Phase 10 Charter

Branch:
phase10/P10-001-quizzes-exams-deadlines-charter

Priority:
P0

Description:
Define Phase 10 scope, rules, exclusions, and ownership boundaries.

Goal:
Prevent scope creep into AI Teacher, payments, admin UI, or client-side grading.

Expected output:
docs/phase-10/quizzes-exams-deadlines-charter.md

Dependencies:
P6-050

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-001 only.

Task:
Create Phase 10 Charter

Branch:
phase10/P10-001-quizzes-exams-deadlines-charter

Priority:
P0

Description:
Define Phase 10 scope, rules, exclusions, and ownership boundaries.

Goal:
Prevent scope creep into AI Teacher, payments, admin UI, or client-side grading.

Expected output:
docs/phase-10/quizzes-exams-deadlines-charter.md

Dependencies:
P6-050

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-001.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-001:".

Done Test:
- Expected output exists: docs/phase-10/quizzes-exams-deadlines-charter.md
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-001

Files created/updated:
- ...

Branch:
phase10/P10-001-quizzes-exams-deadlines-charter

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-002

Task: Create Assessment Domain Map

Branch:
phase10/P10-002-assessment-domain-map

Priority:
P0

Description:
Document quiz, exam, deadline, attempt, score, result, and feedback entities.

Goal:
Establish the assessment domain model before implementation.

Expected output:
docs/phase-10/assessment-domain-map.md

Dependencies:
P10-001

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-002 only.

Task:
Create Assessment Domain Map

Branch:
phase10/P10-002-assessment-domain-map

Priority:
P0

Description:
Document quiz, exam, deadline, attempt, score, result, and feedback entities.

Goal:
Establish the assessment domain model before implementation.

Expected output:
docs/phase-10/assessment-domain-map.md

Dependencies:
P10-001

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-002.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-002:".

Done Test:
- Expected output exists: docs/phase-10/assessment-domain-map.md
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-002

Files created/updated:
- ...

Branch:
phase10/P10-002-assessment-domain-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-003

Task: Create Assessment Authority Rules

Branch:
phase10/P10-003-assessment-authority-rules

Priority:
P0

Description:
Define what the backend controls and what clients may display or submit.

Goal:
Enforce no client-side grading or score authority.

Expected output:
docs/phase-10/assessment-authority-rules.md

Dependencies:
P10-001

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-003 only.

Task:
Create Assessment Authority Rules

Branch:
phase10/P10-003-assessment-authority-rules

Priority:
P0

Description:
Define what the backend controls and what clients may display or submit.

Goal:
Enforce no client-side grading or score authority.

Expected output:
docs/phase-10/assessment-authority-rules.md

Dependencies:
P10-001

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-003.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-003:".

Done Test:
- Expected output exists: docs/phase-10/assessment-authority-rules.md
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-003

Files created/updated:
- ...

Branch:
phase10/P10-003-assessment-authority-rules

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-004

Task: Create Phase 10 API Contract Map

Branch:
phase10/P10-004-api-contract-map

Priority:
P0

Description:
Define expected backend endpoints used by mobile clients.

Goal:
Align backend and Flutter before implementation.

Expected output:
docs/phase-10/assessment-api-contract-map.md

Dependencies:
P10-002

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-004 only.

Task:
Create Phase 10 API Contract Map

Branch:
phase10/P10-004-api-contract-map

Priority:
P0

Description:
Define expected backend endpoints used by mobile clients.

Goal:
Align backend and Flutter before implementation.

Expected output:
docs/phase-10/assessment-api-contract-map.md

Dependencies:
P10-002

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-004.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-004:".

Done Test:
- Expected output exists: docs/phase-10/assessment-api-contract-map.md
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-004

Files created/updated:
- ...

Branch:
phase10/P10-004-api-contract-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-005

Task: Create Mobile Quiz/Exam Flow Map

Branch:
phase10/P10-005-mobile-flow-map

Priority:
P1

Description:
Document student-facing quiz, exam, deadline, attempt, and result screens.

Goal:
Guide Flutter implementation without local authority.

Expected output:
docs/phase-10/mobile-assessment-flow-map.md

Dependencies:
P10-004

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-005 only.

Task:
Create Mobile Quiz/Exam Flow Map

Branch:
phase10/P10-005-mobile-flow-map

Priority:
P1

Description:
Document student-facing quiz, exam, deadline, attempt, and result screens.

Goal:
Guide Flutter implementation without local authority.

Expected output:
docs/phase-10/mobile-assessment-flow-map.md

Dependencies:
P10-004

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-005.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-005:".

Done Test:
- Expected output exists: docs/phase-10/mobile-assessment-flow-map.md
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-005

Files created/updated:
- ...

Branch:
phase10/P10-005-mobile-flow-map

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-006

Task: Create Assessments Table Migration

Branch:
phase10/P10-006-assessments-table-migration

Priority:
P0

Description:
Add base assessment table for quizzes and exams.

Goal:
Store assessment definitions safely.

Expected output:
Migration for assessments table

Dependencies:
P10-002

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-006 only.

Task:
Create Assessments Table Migration

Branch:
phase10/P10-006-assessments-table-migration

Priority:
P0

Description:
Add base assessment table for quizzes and exams.

Goal:
Store assessment definitions safely.

Expected output:
Migration for assessments table

Dependencies:
P10-002

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-006.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-006:".

Done Test:
- Expected output exists: Migration for assessments table
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-006

Files created/updated:
- ...

Branch:
phase10/P10-006-assessments-table-migration

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-007

Task: Create Assessment Sections Table

Branch:
phase10/P10-007-assessment-sections-table

Priority:
P1

Description:
Add sections for exams/quizzes with grouped questions.

Goal:
Support structured exams and multi-section quizzes.

Expected output:
Migration for assessment_sections

Dependencies:
P10-006

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-007 only.

Task:
Create Assessment Sections Table

Branch:
phase10/P10-007-assessment-sections-table

Priority:
P1

Description:
Add sections for exams/quizzes with grouped questions.

Goal:
Support structured exams and multi-section quizzes.

Expected output:
Migration for assessment_sections

Dependencies:
P10-006

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-007.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-007:".

Done Test:
- Expected output exists: Migration for assessment_sections
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-007

Files created/updated:
- ...

Branch:
phase10/P10-007-assessment-sections-table

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-008

Task: Create Assessment Question Links Table

Branch:
phase10/P10-008-assessment-question-links

Priority:
P0

Description:
Link questions from the question bank to assessments.

Goal:
Reuse existing question bank safely.

Expected output:
Migration for assessment_questions

Dependencies:
P10-006, P3 question bank outputs

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-008 only.

Task:
Create Assessment Question Links Table

Branch:
phase10/P10-008-assessment-question-links

Priority:
P0

Description:
Link questions from the question bank to assessments.

Goal:
Reuse existing question bank safely.

Expected output:
Migration for assessment_questions

Dependencies:
P10-006, P3 question bank outputs

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-008.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-008:".

Done Test:
- Expected output exists: Migration for assessment_questions
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-008

Files created/updated:
- ...

Branch:
phase10/P10-008-assessment-question-links

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-009

Task: Create Assessment Settings Table

Branch:
phase10/P10-009-assessment-settings-table

Priority:
P0

Description:
Store duration, attempts allowed, randomization, grading mode, and visibility rules.

Goal:
Keep assessment behavior backend-controlled.

Expected output:
Migration for assessment_settings

Dependencies:
P10-006

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-009 only.

Task:
Create Assessment Settings Table

Branch:
phase10/P10-009-assessment-settings-table

Priority:
P0

Description:
Store duration, attempts allowed, randomization, grading mode, and visibility rules.

Goal:
Keep assessment behavior backend-controlled.

Expected output:
Migration for assessment_settings

Dependencies:
P10-006

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-009.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-009:".

Done Test:
- Expected output exists: Migration for assessment_settings
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-009

Files created/updated:
- ...

Branch:
phase10/P10-009-assessment-settings-table

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-010

Task: Create Deadlines Table

Branch:
phase10/P10-010-deadlines-table

Priority:
P0

Description:
Store due dates, open/close windows, timezone, and late submission policy.

Goal:
Enable deadline-based access and submission control.

Expected output:
Migration for assessment_deadlines

Dependencies:
P10-006

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-010 only.

Task:
Create Deadlines Table

Branch:
phase10/P10-010-deadlines-table

Priority:
P0

Description:
Store due dates, open/close windows, timezone, and late submission policy.

Goal:
Enable deadline-based access and submission control.

Expected output:
Migration for assessment_deadlines

Dependencies:
P10-006

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-010.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-010:".

Done Test:
- Expected output exists: Migration for assessment_deadlines
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-010

Files created/updated:
- ...

Branch:
phase10/P10-010-deadlines-table

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-011

Task: Create Assessment Attempts Table

Branch:
phase10/P10-011-attempts-table

Priority:
P0

Description:
Store student attempt lifecycle and status.

Goal:
Track attempts from start to submission.

Expected output:
Migration for assessment_attempts

Dependencies:
P10-006

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-011 only.

Task:
Create Assessment Attempts Table

Branch:
phase10/P10-011-attempts-table

Priority:
P0

Description:
Store student attempt lifecycle and status.

Goal:
Track attempts from start to submission.

Expected output:
Migration for assessment_attempts

Dependencies:
P10-006

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-011.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-011:".

Done Test:
- Expected output exists: Migration for assessment_attempts
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-011

Files created/updated:
- ...

Branch:
phase10/P10-011-attempts-table

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-012

Task: Create Attempt Answers Table

Branch:
phase10/P10-012-attempt-answers-table

Priority:
P0

Description:
Store submitted answers per attempt.

Goal:
Persist answers for grading/audit.

Expected output:
Migration for assessment_attempt_answers

Dependencies:
P10-011

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-012 only.

Task:
Create Attempt Answers Table

Branch:
phase10/P10-012-attempt-answers-table

Priority:
P0

Description:
Store submitted answers per attempt.

Goal:
Persist answers for grading/audit.

Expected output:
Migration for assessment_attempt_answers

Dependencies:
P10-011

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-012.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-012:".

Done Test:
- Expected output exists: Migration for assessment_attempt_answers
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-012

Files created/updated:
- ...

Branch:
phase10/P10-012-attempt-answers-table

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-013

Task: Create Assessment Results Table

Branch:
phase10/P10-013-results-table

Priority:
P0

Description:
Store backend-approved scores, pass/fail, feedback summary, and status.

Goal:
Persist authoritative assessment result.

Expected output:
Migration for assessment_results

Dependencies:
P10-011

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-013 only.

Task:
Create Assessment Results Table

Branch:
phase10/P10-013-results-table

Priority:
P0

Description:
Store backend-approved scores, pass/fail, feedback summary, and status.

Goal:
Persist authoritative assessment result.

Expected output:
Migration for assessment_results

Dependencies:
P10-011

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-013.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-013:".

Done Test:
- Expected output exists: Migration for assessment_results
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-013

Files created/updated:
- ...

Branch:
phase10/P10-013-results-table

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-014

Task: Create Result Breakdown Table

Branch:
phase10/P10-014-result-breakdown-table

Priority:
P1

Description:
Store per-skill/per-section score breakdown.

Goal:
Support analytics and progress display.

Expected output:
Migration for assessment_result_breakdowns

Dependencies:
P10-013

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-014 only.

Task:
Create Result Breakdown Table

Branch:
phase10/P10-014-result-breakdown-table

Priority:
P1

Description:
Store per-skill/per-section score breakdown.

Goal:
Support analytics and progress display.

Expected output:
Migration for assessment_result_breakdowns

Dependencies:
P10-013

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-014.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-014:".

Done Test:
- Expected output exists: Migration for assessment_result_breakdowns
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-014

Files created/updated:
- ...

Branch:
phase10/P10-014-result-breakdown-table

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-015

Task: Create Deadline Events Table

Branch:
phase10/P10-015-deadline-events-table

Priority:
P1

Description:
Store audit events for opened, closed, late, extended, submitted, and missed deadlines.

Goal:
Improve traceability of deadline decisions.

Expected output:
Migration for deadline_events

Dependencies:
P10-010

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-015 only.

Task:
Create Deadline Events Table

Branch:
phase10/P10-015-deadline-events-table

Priority:
P1

Description:
Store audit events for opened, closed, late, extended, submitted, and missed deadlines.

Goal:
Improve traceability of deadline decisions.

Expected output:
Migration for deadline_events

Dependencies:
P10-010

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-015.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-015:".

Done Test:
- Expected output exists: Migration for deadline_events
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-015

Files created/updated:
- ...

Branch:
phase10/P10-015-deadline-events-table

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-016

Task: Create Assessment Audit Log Table

Branch:
phase10/P10-016-assessment-audit-table

Priority:
P1

Description:
Store safe metadata for grading, attempt, and result events.

Goal:
Add auditability without leaking sensitive data.

Expected output:
Migration for assessment_audit_logs

Dependencies:
P10-011, P10-013

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-016 only.

Task:
Create Assessment Audit Log Table

Branch:
phase10/P10-016-assessment-audit-table

Priority:
P1

Description:
Store safe metadata for grading, attempt, and result events.

Goal:
Add auditability without leaking sensitive data.

Expected output:
Migration for assessment_audit_logs

Dependencies:
P10-011, P10-013

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-016.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-016:".

Done Test:
- Expected output exists: Migration for assessment_audit_logs
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-016

Files created/updated:
- ...

Branch:
phase10/P10-016-assessment-audit-table

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-017

Task: Add Assessment DB Constraints

Branch:
phase10/P10-017-db-constraints

Priority:
P0

Description:
Add required foreign keys, unique constraints, status checks, and indexes.

Goal:
Prevent invalid assessment state.

Expected output:
Updated migrations/constraint migration

Dependencies:
P10-006..P10-016

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-017 only.

Task:
Add Assessment DB Constraints

Branch:
phase10/P10-017-db-constraints

Priority:
P0

Description:
Add required foreign keys, unique constraints, status checks, and indexes.

Goal:
Prevent invalid assessment state.

Expected output:
Updated migrations/constraint migration

Dependencies:
P10-006..P10-016

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-017.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-017:".

Done Test:
- Expected output exists: Updated migrations/constraint migration
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-017

Files created/updated:
- ...

Branch:
phase10/P10-017-db-constraints

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-018

Task: Add Assessment Seed Data

Branch:
phase10/P10-018-assessment-seed-data

Priority:
P2

Description:
Add safe development seed data for sample quizzes/exams.

Goal:
Support local testing.

Expected output:
Seed data or fixture files

Dependencies:
P10-017

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-018 only.

Task:
Add Assessment Seed Data

Branch:
phase10/P10-018-assessment-seed-data

Priority:
P2

Description:
Add safe development seed data for sample quizzes/exams.

Goal:
Support local testing.

Expected output:
Seed data or fixture files

Dependencies:
P10-017

Scope:
Documentation/database schema task. No Flutter UI. No backend runtime behavior unless explicitly required.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-018.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-018:".

Done Test:
- Expected output exists: Seed data or fixture files
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-018

Files created/updated:
- ...

Branch:
phase10/P10-018-assessment-seed-data

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-019

Task: Create Backend Assessments Module

Branch:
phase10/P10-019-backend-assessments-module

Priority:
P0

Description:
Add feature module for assessments.

Goal:
Establish backend feature boundary.

Expected output:
services/backend-api/src/features/assessments/

Dependencies:
P10-017

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-019 only.

Task:
Create Backend Assessments Module

Branch:
phase10/P10-019-backend-assessments-module

Priority:
P0

Description:
Add feature module for assessments.

Goal:
Establish backend feature boundary.

Expected output:
services/backend-api/src/features/assessments/

Dependencies:
P10-017

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-019.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-019:".

Done Test:
- Expected output exists: services/backend-api/src/features/assessments/
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-019

Files created/updated:
- ...

Branch:
phase10/P10-019-backend-assessments-module

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-020

Task: Create Assessment Entities and DTOs

Branch:
phase10/P10-020-assessment-entities-dtos

Priority:
P0

Description:
Define DTOs/entities for assessments, settings, deadlines, attempts, answers, and results.

Goal:
Standardize backend contracts.

Expected output:
Assessment DTO/entity files

Dependencies:
P10-019

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-020 only.

Task:
Create Assessment Entities and DTOs

Branch:
phase10/P10-020-assessment-entities-dtos

Priority:
P0

Description:
Define DTOs/entities for assessments, settings, deadlines, attempts, answers, and results.

Goal:
Standardize backend contracts.

Expected output:
Assessment DTO/entity files

Dependencies:
P10-019

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-020.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-020:".

Done Test:
- Expected output exists: Assessment DTO/entity files
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-020

Files created/updated:
- ...

Branch:
phase10/P10-020-assessment-entities-dtos

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-021

Task: Add Assessment Validation Rules

Branch:
phase10/P10-021-assessment-validation

Priority:
P0

Description:
Validate assessment types, deadlines, settings, attempt state, and submitted answers.

Goal:
Reject invalid data before persistence.

Expected output:
Validation pipes/helpers/tests

Dependencies:
P10-020

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-021 only.

Task:
Add Assessment Validation Rules

Branch:
phase10/P10-021-assessment-validation

Priority:
P0

Description:
Validate assessment types, deadlines, settings, attempt state, and submitted answers.

Goal:
Reject invalid data before persistence.

Expected output:
Validation pipes/helpers/tests

Dependencies:
P10-020

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-021.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-021:".

Done Test:
- Expected output exists: Validation pipes/helpers/tests
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-021

Files created/updated:
- ...

Branch:
phase10/P10-021-assessment-validation

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-022

Task: Create Assessment Repository Layer

Branch:
phase10/P10-022-assessment-repository

Priority:
P0

Description:
Add backend repository/data access methods.

Goal:
Encapsulate assessment persistence.

Expected output:
Assessment repository implementation

Dependencies:
P10-020

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-022 only.

Task:
Create Assessment Repository Layer

Branch:
phase10/P10-022-assessment-repository

Priority:
P0

Description:
Add backend repository/data access methods.

Goal:
Encapsulate assessment persistence.

Expected output:
Assessment repository implementation

Dependencies:
P10-020

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-022.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-022:".

Done Test:
- Expected output exists: Assessment repository implementation
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-022

Files created/updated:
- ...

Branch:
phase10/P10-022-assessment-repository

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-023

Task: Create Assessment Service

Branch:
phase10/P10-023-assessment-service

Priority:
P0

Description:
Add service for listing, reading, and resolving assessment definitions.

Goal:
Provide backend assessment logic.

Expected output:
Assessment service

Dependencies:
P10-022

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-023 only.

Task:
Create Assessment Service

Branch:
phase10/P10-023-assessment-service

Priority:
P0

Description:
Add service for listing, reading, and resolving assessment definitions.

Goal:
Provide backend assessment logic.

Expected output:
Assessment service

Dependencies:
P10-022

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-023.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-023:".

Done Test:
- Expected output exists: Assessment service
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-023

Files created/updated:
- ...

Branch:
phase10/P10-023-assessment-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-024

Task: Create Deadline Service

Branch:
phase10/P10-024-deadline-service

Priority:
P0

Description:
Add backend service for availability, due date, open/close window, and late status.

Goal:
Centralize deadline authority.

Expected output:
Deadline service

Dependencies:
P10-010, P10-023

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-024 only.

Task:
Create Deadline Service

Branch:
phase10/P10-024-deadline-service

Priority:
P0

Description:
Add backend service for availability, due date, open/close window, and late status.

Goal:
Centralize deadline authority.

Expected output:
Deadline service

Dependencies:
P10-010, P10-023

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-024.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-024:".

Done Test:
- Expected output exists: Deadline service
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-024

Files created/updated:
- ...

Branch:
phase10/P10-024-deadline-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-025

Task: Create Attempt Lifecycle Service

Branch:
phase10/P10-025-attempt-service

Priority:
P0

Description:
Add start, resume, submit, expire, and cancel attempt logic.

Goal:
Control attempt lifecycle backend-side.

Expected output:
Attempt service

Dependencies:
P10-011, P10-024

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-025 only.

Task:
Create Attempt Lifecycle Service

Branch:
phase10/P10-025-attempt-service

Priority:
P0

Description:
Add start, resume, submit, expire, and cancel attempt logic.

Goal:
Control attempt lifecycle backend-side.

Expected output:
Attempt service

Dependencies:
P10-011, P10-024

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-025.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-025:".

Done Test:
- Expected output exists: Attempt service
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-025

Files created/updated:
- ...

Branch:
phase10/P10-025-attempt-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-026

Task: Create Answer Submission Service

Branch:
phase10/P10-026-answer-submission-service

Priority:
P0

Description:
Validate and persist submitted answers.

Goal:
Ensure safe answer capture.

Expected output:
Answer submission service

Dependencies:
P10-012, P10-025

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-026 only.

Task:
Create Answer Submission Service

Branch:
phase10/P10-026-answer-submission-service

Priority:
P0

Description:
Validate and persist submitted answers.

Goal:
Ensure safe answer capture.

Expected output:
Answer submission service

Dependencies:
P10-012, P10-025

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-026.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-026:".

Done Test:
- Expected output exists: Answer submission service
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-026

Files created/updated:
- ...

Branch:
phase10/P10-026-answer-submission-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-027

Task: Create Grading Service

Branch:
phase10/P10-027-grading-service

Priority:
P0

Description:
Calculate correctness and scores on backend only.

Goal:
Make backend final authority for grading.

Expected output:
Grading service

Dependencies:
P10-012, P3 question bank outputs

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-027 only.

Task:
Create Grading Service

Branch:
phase10/P10-027-grading-service

Priority:
P0

Description:
Calculate correctness and scores on backend only.

Goal:
Make backend final authority for grading.

Expected output:
Grading service

Dependencies:
P10-012, P3 question bank outputs

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-027.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-027:".

Done Test:
- Expected output exists: Grading service
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-027

Files created/updated:
- ...

Branch:
phase10/P10-027-grading-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-028

Task: Create Score Policy Service

Branch:
phase10/P10-028-score-policy-service

Priority:
P0

Description:
Handle pass/fail, weights, penalties, and grading rules.

Goal:
Standardize scoring policy.

Expected output:
Score policy service

Dependencies:
P10-027

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-028 only.

Task:
Create Score Policy Service

Branch:
phase10/P10-028-score-policy-service

Priority:
P0

Description:
Handle pass/fail, weights, penalties, and grading rules.

Goal:
Standardize scoring policy.

Expected output:
Score policy service

Dependencies:
P10-027

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-028.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-028:".

Done Test:
- Expected output exists: Score policy service
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-028

Files created/updated:
- ...

Branch:
phase10/P10-028-score-policy-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-029

Task: Create Assessment Result Service

Branch:
phase10/P10-029-result-service

Priority:
P0

Description:
Persist authoritative result after grading.

Goal:
Store score, status, feedback, and breakdown.

Expected output:
Result service

Dependencies:
P10-013, P10-027, P10-028

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-029 only.

Task:
Create Assessment Result Service

Branch:
phase10/P10-029-result-service

Priority:
P0

Description:
Persist authoritative result after grading.

Goal:
Store score, status, feedback, and breakdown.

Expected output:
Result service

Dependencies:
P10-013, P10-027, P10-028

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-029.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-029:".

Done Test:
- Expected output exists: Result service
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-029

Files created/updated:
- ...

Branch:
phase10/P10-029-result-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-030

Task: Create Assessment Feedback Service

Branch:
phase10/P10-030-feedback-service

Priority:
P1

Description:
Generate backend-approved feedback summaries.

Goal:
Provide safe feedback for mobile display.

Expected output:
Feedback service

Dependencies:
P10-029

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-030 only.

Task:
Create Assessment Feedback Service

Branch:
phase10/P10-030-feedback-service

Priority:
P1

Description:
Generate backend-approved feedback summaries.

Goal:
Provide safe feedback for mobile display.

Expected output:
Feedback service

Dependencies:
P10-029

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-030.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-030:".

Done Test:
- Expected output exists: Feedback service
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-030

Files created/updated:
- ...

Branch:
phase10/P10-030-feedback-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-031

Task: Create Assessment Audit Service

Branch:
phase10/P10-031-assessment-audit-service

Priority:
P1

Description:
Log safe assessment lifecycle metadata.

Goal:
Track events without exposing sensitive data.

Expected output:
Audit service

Dependencies:
P10-016, P10-025, P10-029

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-031 only.

Task:
Create Assessment Audit Service

Branch:
phase10/P10-031-assessment-audit-service

Priority:
P1

Description:
Log safe assessment lifecycle metadata.

Goal:
Track events without exposing sensitive data.

Expected output:
Audit service

Dependencies:
P10-016, P10-025, P10-029

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-031.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-031:".

Done Test:
- Expected output exists: Audit service
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-031

Files created/updated:
- ...

Branch:
phase10/P10-031-assessment-audit-service

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-032

Task: Add Assessment Permission Guards

Branch:
phase10/P10-032-assessment-permission-guards

Priority:
P0

Description:
Protect assessment, attempt, deadline, and result APIs.

Goal:
Prevent unauthorized access.

Expected output:
Guards/policies/tests

Dependencies:
P10-019

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-032 only.

Task:
Add Assessment Permission Guards

Branch:
phase10/P10-032-assessment-permission-guards

Priority:
P0

Description:
Protect assessment, attempt, deadline, and result APIs.

Goal:
Prevent unauthorized access.

Expected output:
Guards/policies/tests

Dependencies:
P10-019

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-032.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-032:".

Done Test:
- Expected output exists: Guards/policies/tests
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-032

Files created/updated:
- ...

Branch:
phase10/P10-032-assessment-permission-guards

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-033

Task: Create Student Assessment List API

Branch:
phase10/P10-033-assessment-list-api

Priority:
P0

Description:
Return available quizzes/exams for authenticated student.

Goal:
Feed mobile assessment list.

Expected output:
GET /student/assessments or equivalent

Dependencies:
P10-023, P10-032

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-033 only.

Task:
Create Student Assessment List API

Branch:
phase10/P10-033-assessment-list-api

Priority:
P0

Description:
Return available quizzes/exams for authenticated student.

Goal:
Feed mobile assessment list.

Expected output:
GET /student/assessments or equivalent

Dependencies:
P10-023, P10-032

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-033.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-033:".

Done Test:
- Expected output exists: GET /student/assessments or equivalent
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-033

Files created/updated:
- ...

Branch:
phase10/P10-033-assessment-list-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-034

Task: Create Student Assessment Detail API

Branch:
phase10/P10-034-assessment-detail-api

Priority:
P0

Description:
Return assessment metadata, settings, and deadline state.

Goal:
Feed assessment detail page.

Expected output:
Assessment detail endpoint

Dependencies:
P10-023, P10-024, P10-032

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-034 only.

Task:
Create Student Assessment Detail API

Branch:
phase10/P10-034-assessment-detail-api

Priority:
P0

Description:
Return assessment metadata, settings, and deadline state.

Goal:
Feed assessment detail page.

Expected output:
Assessment detail endpoint

Dependencies:
P10-023, P10-024, P10-032

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-034.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-034:".

Done Test:
- Expected output exists: Assessment detail endpoint
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-034

Files created/updated:
- ...

Branch:
phase10/P10-034-assessment-detail-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-035

Task: Create Start Attempt API

Branch:
phase10/P10-035-start-attempt-api

Priority:
P0

Description:
Start an attempt if eligible.

Goal:
Backend controls attempt eligibility.

Expected output:
Start attempt endpoint

Dependencies:
P10-025, P10-032

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-035 only.

Task:
Create Start Attempt API

Branch:
phase10/P10-035-start-attempt-api

Priority:
P0

Description:
Start an attempt if eligible.

Goal:
Backend controls attempt eligibility.

Expected output:
Start attempt endpoint

Dependencies:
P10-025, P10-032

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-035.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-035:".

Done Test:
- Expected output exists: Start attempt endpoint
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-035

Files created/updated:
- ...

Branch:
phase10/P10-035-start-attempt-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-036

Task: Create Resume Attempt API

Branch:
phase10/P10-036-resume-attempt-api

Priority:
P1

Description:
Resume active attempt safely.

Goal:
Support interrupted mobile sessions.

Expected output:
Resume attempt endpoint

Dependencies:
P10-025, P10-032

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-036 only.

Task:
Create Resume Attempt API

Branch:
phase10/P10-036-resume-attempt-api

Priority:
P1

Description:
Resume active attempt safely.

Goal:
Support interrupted mobile sessions.

Expected output:
Resume attempt endpoint

Dependencies:
P10-025, P10-032

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-036.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-036:".

Done Test:
- Expected output exists: Resume attempt endpoint
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-036

Files created/updated:
- ...

Branch:
phase10/P10-036-resume-attempt-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-037

Task: Create Submit Attempt API

Branch:
phase10/P10-037-submit-attempt-api

Priority:
P0

Description:
Submit attempt answers to backend.

Goal:
Backend controls submission and grading.

Expected output:
Submit attempt endpoint

Dependencies:
P10-026, P10-027, P10-029, P10-032

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-037 only.

Task:
Create Submit Attempt API

Branch:
phase10/P10-037-submit-attempt-api

Priority:
P0

Description:
Submit attempt answers to backend.

Goal:
Backend controls submission and grading.

Expected output:
Submit attempt endpoint

Dependencies:
P10-026, P10-027, P10-029, P10-032

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-037.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-037:".

Done Test:
- Expected output exists: Submit attempt endpoint
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-037

Files created/updated:
- ...

Branch:
phase10/P10-037-submit-attempt-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-038

Task: Create Attempt Result API

Branch:
phase10/P10-038-attempt-result-api

Priority:
P0

Description:
Return backend-approved result.

Goal:
Mobile displays result only.

Expected output:
Result endpoint

Dependencies:
P10-029, P10-032

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-038 only.

Task:
Create Attempt Result API

Branch:
phase10/P10-038-attempt-result-api

Priority:
P0

Description:
Return backend-approved result.

Goal:
Mobile displays result only.

Expected output:
Result endpoint

Dependencies:
P10-029, P10-032

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-038.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-038:".

Done Test:
- Expected output exists: Result endpoint
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-038

Files created/updated:
- ...

Branch:
phase10/P10-038-attempt-result-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-039

Task: Create Student Deadlines API

Branch:
phase10/P10-039-deadlines-api

Priority:
P0

Description:
Return upcoming, active, closed, missed, and late deadlines.

Goal:
Feed mobile deadlines page.

Expected output:
Deadline endpoints

Dependencies:
P10-024, P10-032

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-039 only.

Task:
Create Student Deadlines API

Branch:
phase10/P10-039-deadlines-api

Priority:
P0

Description:
Return upcoming, active, closed, missed, and late deadlines.

Goal:
Feed mobile deadlines page.

Expected output:
Deadline endpoints

Dependencies:
P10-024, P10-032

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-039.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-039:".

Done Test:
- Expected output exists: Deadline endpoints
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-039

Files created/updated:
- ...

Branch:
phase10/P10-039-deadlines-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-040

Task: Create Assessment Result History API

Branch:
phase10/P10-040-result-history-api

Priority:
P1

Description:
Return previous attempts and results.

Goal:
Support progress/history display.

Expected output:
Result history endpoint

Dependencies:
P10-029, P10-032

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-040 only.

Task:
Create Assessment Result History API

Branch:
phase10/P10-040-result-history-api

Priority:
P1

Description:
Return previous attempts and results.

Goal:
Support progress/history display.

Expected output:
Result history endpoint

Dependencies:
P10-029, P10-032

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-040.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-040:".

Done Test:
- Expected output exists: Result history endpoint
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-040

Files created/updated:
- ...

Branch:
phase10/P10-040-result-history-api

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-041

Task: Add Question Delivery Safety Rules

Branch:
phase10/P10-041-question-delivery-safety

Priority:
P0

Description:
Avoid leaking correct answers or grading metadata to clients.

Goal:
Prevent client-side correctness inference.

Expected output:
Question delivery filters/tests

Dependencies:
P10-034, P10-035

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-041 only.

Task:
Add Question Delivery Safety Rules

Branch:
phase10/P10-041-question-delivery-safety

Priority:
P0

Description:
Avoid leaking correct answers or grading metadata to clients.

Goal:
Prevent client-side correctness inference.

Expected output:
Question delivery filters/tests

Dependencies:
P10-034, P10-035

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-041.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-041:".

Done Test:
- Expected output exists: Question delivery filters/tests
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-041

Files created/updated:
- ...

Branch:
phase10/P10-041-question-delivery-safety

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-042

Task: Add Deadline Enforcement Tests

Branch:
phase10/P10-042-deadline-enforcement-tests

Priority:
P0

Description:
Test closed, late, missed, open, and extended windows.

Goal:
Verify backend deadline authority.

Expected output:
Backend test suite

Dependencies:
P10-024, P10-039

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-042 only.

Task:
Add Deadline Enforcement Tests

Branch:
phase10/P10-042-deadline-enforcement-tests

Priority:
P0

Description:
Test closed, late, missed, open, and extended windows.

Goal:
Verify backend deadline authority.

Expected output:
Backend test suite

Dependencies:
P10-024, P10-039

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-042.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-042:".

Done Test:
- Expected output exists: Backend test suite
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-042

Files created/updated:
- ...

Branch:
phase10/P10-042-deadline-enforcement-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-043

Task: Add Attempt Lifecycle Tests

Branch:
phase10/P10-043-attempt-lifecycle-tests

Priority:
P0

Description:
Test start, resume, submit, expire, duplicate submit, max attempts.

Goal:
Verify attempt state machine.

Expected output:
Backend test suite

Dependencies:
P10-025, P10-035..P10-037

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-043 only.

Task:
Add Attempt Lifecycle Tests

Branch:
phase10/P10-043-attempt-lifecycle-tests

Priority:
P0

Description:
Test start, resume, submit, expire, duplicate submit, max attempts.

Goal:
Verify attempt state machine.

Expected output:
Backend test suite

Dependencies:
P10-025, P10-035..P10-037

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-043.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-043:".

Done Test:
- Expected output exists: Backend test suite
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-043

Files created/updated:
- ...

Branch:
phase10/P10-043-attempt-lifecycle-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-044

Task: Add Grading Tests

Branch:
phase10/P10-044-grading-tests

Priority:
P0

Description:
Test MCQ, written answer support if available, score weights, penalties.

Goal:
Verify backend grading correctness.

Expected output:
Backend test suite

Dependencies:
P10-027, P10-028

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-044 only.

Task:
Add Grading Tests

Branch:
phase10/P10-044-grading-tests

Priority:
P0

Description:
Test MCQ, written answer support if available, score weights, penalties.

Goal:
Verify backend grading correctness.

Expected output:
Backend test suite

Dependencies:
P10-027, P10-028

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-044.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-044:".

Done Test:
- Expected output exists: Backend test suite
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-044

Files created/updated:
- ...

Branch:
phase10/P10-044-grading-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-045

Task: Add Assessment Permission Tests

Branch:
phase10/P10-045-permission-tests

Priority:
P0

Description:
Test students cannot access other students’ attempts/results.

Goal:
Protect student data.

Expected output:
Backend test suite

Dependencies:
P10-032..P10-040

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-045 only.

Task:
Add Assessment Permission Tests

Branch:
phase10/P10-045-permission-tests

Priority:
P0

Description:
Test students cannot access other students’ attempts/results.

Goal:
Protect student data.

Expected output:
Backend test suite

Dependencies:
P10-032..P10-040

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-045.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-045:".

Done Test:
- Expected output exists: Backend test suite
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-045

Files created/updated:
- ...

Branch:
phase10/P10-045-permission-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-046

Task: Add No Client Authority API Tests

Branch:
phase10/P10-046-no-client-authority-api-tests

Priority:
P0

Description:
Ensure submitted score/correctness/mastery fields are ignored/rejected.

Goal:
Prevent client-controlled assessment outcomes.

Expected output:
Backend test suite

Dependencies:
P10-037, P10-038

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-046 only.

Task:
Add No Client Authority API Tests

Branch:
phase10/P10-046-no-client-authority-api-tests

Priority:
P0

Description:
Ensure submitted score/correctness/mastery fields are ignored/rejected.

Goal:
Prevent client-controlled assessment outcomes.

Expected output:
Backend test suite

Dependencies:
P10-037, P10-038

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-046.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-046:".

Done Test:
- Expected output exists: Backend test suite
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-046

Files created/updated:
- ...

Branch:
phase10/P10-046-no-client-authority-api-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-047

Task: Add Assessment Error Handling

Branch:
phase10/P10-047-assessment-error-handling

Priority:
P1

Description:
Standardize errors for unavailable, expired, unauthorized, invalid attempt, duplicate submission.

Goal:
Improve API reliability.

Expected output:
Error handling + tests

Dependencies:
P10-033..P10-040

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-047 only.

Task:
Add Assessment Error Handling

Branch:
phase10/P10-047-assessment-error-handling

Priority:
P1

Description:
Standardize errors for unavailable, expired, unauthorized, invalid attempt, duplicate submission.

Goal:
Improve API reliability.

Expected output:
Error handling + tests

Dependencies:
P10-033..P10-040

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-047.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-047:".

Done Test:
- Expected output exists: Error handling + tests
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-047

Files created/updated:
- ...

Branch:
phase10/P10-047-assessment-error-handling

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-048

Task: Document Assessment API Contracts

Branch:
phase10/P10-048-assessment-openapi-docs

Priority:
P1

Description:
Update API docs/contracts for mobile/backend alignment.

Goal:
Make endpoints discoverable and stable.

Expected output:
API contract docs

Dependencies:
P10-033..P10-040

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-048 only.

Task:
Document Assessment API Contracts

Branch:
phase10/P10-048-assessment-openapi-docs

Priority:
P1

Description:
Update API docs/contracts for mobile/backend alignment.

Goal:
Make endpoints discoverable and stable.

Expected output:
API contract docs

Dependencies:
P10-033..P10-040

Scope:
Backend assessment module/API/tests task. Preserve backend-only grading and deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-048.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-048:".

Done Test:
- Expected output exists: API contract docs
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-048

Files created/updated:
- ...

Branch:
phase10/P10-048-assessment-openapi-docs

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-049

Task: Create Mobile Assessment Feature Shell

Branch:
phase10/P10-049-mobile-assessment-feature-shell

Priority:
P0

Description:
Add Flutter feature folders for assessments.

Goal:
Establish mobile feature boundary.

Expected output:
apps/mobile/lib/features/assessments/

Dependencies:
P6-050, P10-004

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-049 only.

Task:
Create Mobile Assessment Feature Shell

Branch:
phase10/P10-049-mobile-assessment-feature-shell

Priority:
P0

Description:
Add Flutter feature folders for assessments.

Goal:
Establish mobile feature boundary.

Expected output:
apps/mobile/lib/features/assessments/

Dependencies:
P6-050, P10-004

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-049.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-049:".

Done Test:
- Expected output exists: apps/mobile/lib/features/assessments/
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-049

Files created/updated:
- ...

Branch:
phase10/P10-049-mobile-assessment-feature-shell

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-050

Task: Create Mobile Assessment Models

Branch:
phase10/P10-050-mobile-assessment-models

Priority:
P0

Description:
Add read models for assessments, deadlines, attempts, answers, results.

Goal:
Align Flutter models with backend contracts.

Expected output:
Flutter models/entities

Dependencies:
P10-049, P10-048

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-050 only.

Task:
Create Mobile Assessment Models

Branch:
phase10/P10-050-mobile-assessment-models

Priority:
P0

Description:
Add read models for assessments, deadlines, attempts, answers, results.

Goal:
Align Flutter models with backend contracts.

Expected output:
Flutter models/entities

Dependencies:
P10-049, P10-048

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-050.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-050:".

Done Test:
- Expected output exists: Flutter models/entities
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-050

Files created/updated:
- ...

Branch:
phase10/P10-050-mobile-assessment-models

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-051

Task: Create Mobile Assessment Datasource

Branch:
phase10/P10-051-mobile-assessment-datasource

Priority:
P0

Description:
Add API datasource for assessment endpoints.

Goal:
Connect mobile to backend APIs only.

Expected output:
Flutter datasource

Dependencies:
P10-050, P10-033..P10-040

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-051 only.

Task:
Create Mobile Assessment Datasource

Branch:
phase10/P10-051-mobile-assessment-datasource

Priority:
P0

Description:
Add API datasource for assessment endpoints.

Goal:
Connect mobile to backend APIs only.

Expected output:
Flutter datasource

Dependencies:
P10-050, P10-033..P10-040

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-051.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-051:".

Done Test:
- Expected output exists: Flutter datasource
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-051

Files created/updated:
- ...

Branch:
phase10/P10-051-mobile-assessment-datasource

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-052

Task: Create Mobile Assessment Repository

Branch:
phase10/P10-052-mobile-assessment-repository

Priority:
P0

Description:
Add repository abstraction/implementation.

Goal:
Keep feature-first architecture.

Expected output:
Flutter repository files

Dependencies:
P10-051

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-052 only.

Task:
Create Mobile Assessment Repository

Branch:
phase10/P10-052-mobile-assessment-repository

Priority:
P0

Description:
Add repository abstraction/implementation.

Goal:
Keep feature-first architecture.

Expected output:
Flutter repository files

Dependencies:
P10-051

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-052.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-052:".

Done Test:
- Expected output exists: Flutter repository files
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-052

Files created/updated:
- ...

Branch:
phase10/P10-052-mobile-assessment-repository

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-053

Task: Create Mobile Assessment Providers

Branch:
phase10/P10-053-mobile-assessment-providers

Priority:
P0

Description:
Add Riverpod providers/state for assessments.

Goal:
Manage UI state safely.

Expected output:
Flutter providers

Dependencies:
P10-052

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-053 only.

Task:
Create Mobile Assessment Providers

Branch:
phase10/P10-053-mobile-assessment-providers

Priority:
P0

Description:
Add Riverpod providers/state for assessments.

Goal:
Manage UI state safely.

Expected output:
Flutter providers

Dependencies:
P10-052

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-053.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-053:".

Done Test:
- Expected output exists: Flutter providers
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-053

Files created/updated:
- ...

Branch:
phase10/P10-053-mobile-assessment-providers

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-054

Task: Create Mobile Assessment List Page

Branch:
phase10/P10-054-mobile-assessment-list-page

Priority:
P0

Description:
Display available quizzes/exams.

Goal:
Let student access assessments.

Expected output:
Assessment list UI

Dependencies:
P10-053

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-054 only.

Task:
Create Mobile Assessment List Page

Branch:
phase10/P10-054-mobile-assessment-list-page

Priority:
P0

Description:
Display available quizzes/exams.

Goal:
Let student access assessments.

Expected output:
Assessment list UI

Dependencies:
P10-053

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-054.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-054:".

Done Test:
- Expected output exists: Assessment list UI
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-054

Files created/updated:
- ...

Branch:
phase10/P10-054-mobile-assessment-list-page

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-055

Task: Create Mobile Assessment Detail Page

Branch:
phase10/P10-055-mobile-assessment-detail-page

Priority:
P0

Description:
Display assessment settings, status, attempts, and deadline info.

Goal:
Prepare student before attempt.

Expected output:
Assessment detail UI

Dependencies:
P10-054

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-055 only.

Task:
Create Mobile Assessment Detail Page

Branch:
phase10/P10-055-mobile-assessment-detail-page

Priority:
P0

Description:
Display assessment settings, status, attempts, and deadline info.

Goal:
Prepare student before attempt.

Expected output:
Assessment detail UI

Dependencies:
P10-054

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-055.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-055:".

Done Test:
- Expected output exists: Assessment detail UI
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-055

Files created/updated:
- ...

Branch:
phase10/P10-055-mobile-assessment-detail-page

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-056

Task: Create Mobile Deadlines Page

Branch:
phase10/P10-056-mobile-deadlines-page

Priority:
P0

Description:
Display upcoming, active, missed, and closed deadlines.

Goal:
Help student track deadlines.

Expected output:
Deadlines UI

Dependencies:
P10-053, P10-039

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-056 only.

Task:
Create Mobile Deadlines Page

Branch:
phase10/P10-056-mobile-deadlines-page

Priority:
P0

Description:
Display upcoming, active, missed, and closed deadlines.

Goal:
Help student track deadlines.

Expected output:
Deadlines UI

Dependencies:
P10-053, P10-039

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-056.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-056:".

Done Test:
- Expected output exists: Deadlines UI
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-056

Files created/updated:
- ...

Branch:
phase10/P10-056-mobile-deadlines-page

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-057

Task: Create Mobile Start Attempt Flow

Branch:
phase10/P10-057-mobile-start-attempt-flow

Priority:
P0

Description:
Call backend start attempt endpoint and route to attempt screen.

Goal:
Start attempts safely.

Expected output:
Start attempt UI/logic

Dependencies:
P10-055, P10-035

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-057 only.

Task:
Create Mobile Start Attempt Flow

Branch:
phase10/P10-057-mobile-start-attempt-flow

Priority:
P0

Description:
Call backend start attempt endpoint and route to attempt screen.

Goal:
Start attempts safely.

Expected output:
Start attempt UI/logic

Dependencies:
P10-055, P10-035

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-057.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-057:".

Done Test:
- Expected output exists: Start attempt UI/logic
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-057

Files created/updated:
- ...

Branch:
phase10/P10-057-mobile-start-attempt-flow

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-058

Task: Create Mobile Attempt Screen

Branch:
phase10/P10-058-mobile-attempt-screen

Priority:
P0

Description:
Display questions and collect answers.

Goal:
Allow student to answer assessment.

Expected output:
Attempt UI

Dependencies:
P10-057

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-058 only.

Task:
Create Mobile Attempt Screen

Branch:
phase10/P10-058-mobile-attempt-screen

Priority:
P0

Description:
Display questions and collect answers.

Goal:
Allow student to answer assessment.

Expected output:
Attempt UI

Dependencies:
P10-057

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-058.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-058:".

Done Test:
- Expected output exists: Attempt UI
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-058

Files created/updated:
- ...

Branch:
phase10/P10-058-mobile-attempt-screen

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-059

Task: Create Attempt Timer UI

Branch:
phase10/P10-059-mobile-attempt-timer-ui

Priority:
P1

Description:
Display backend-provided remaining time if timed.

Goal:
Improve exam UX without local authority.

Expected output:
Timer UI component

Dependencies:
P10-058

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-059 only.

Task:
Create Attempt Timer UI

Branch:
phase10/P10-059-mobile-attempt-timer-ui

Priority:
P1

Description:
Display backend-provided remaining time if timed.

Goal:
Improve exam UX without local authority.

Expected output:
Timer UI component

Dependencies:
P10-058

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-059.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-059:".

Done Test:
- Expected output exists: Timer UI component
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-059

Files created/updated:
- ...

Branch:
phase10/P10-059-mobile-attempt-timer-ui

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-060

Task: Add Safe Answer Draft State

Branch:
phase10/P10-060-mobile-answer-draft-state

Priority:
P1

Description:
Store temporary UI-only answers before submission.

Goal:
Prevent accidental data loss.

Expected output:
Local UI state only

Dependencies:
P10-058

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-060 only.

Task:
Add Safe Answer Draft State

Branch:
phase10/P10-060-mobile-answer-draft-state

Priority:
P1

Description:
Store temporary UI-only answers before submission.

Goal:
Prevent accidental data loss.

Expected output:
Local UI state only

Dependencies:
P10-058

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-060.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-060:".

Done Test:
- Expected output exists: Local UI state only
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-060

Files created/updated:
- ...

Branch:
phase10/P10-060-mobile-answer-draft-state

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-061

Task: Create Submit Attempt Flow

Branch:
phase10/P10-061-mobile-submit-attempt-flow

Priority:
P0

Description:
Submit answers to backend and wait for authoritative result.

Goal:
Complete assessment submission safely.

Expected output:
Submit flow

Dependencies:
P10-037, P10-058

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-061 only.

Task:
Create Submit Attempt Flow

Branch:
phase10/P10-061-mobile-submit-attempt-flow

Priority:
P0

Description:
Submit answers to backend and wait for authoritative result.

Goal:
Complete assessment submission safely.

Expected output:
Submit flow

Dependencies:
P10-037, P10-058

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-061.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-061:".

Done Test:
- Expected output exists: Submit flow
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-061

Files created/updated:
- ...

Branch:
phase10/P10-061-mobile-submit-attempt-flow

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-062

Task: Create Assessment Result Page

Branch:
phase10/P10-062-mobile-result-page

Priority:
P0

Description:
Display backend-approved score, status, feedback, and breakdown.

Goal:
Show result without local calculation.

Expected output:
Result UI

Dependencies:
P10-038, P10-061

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-062 only.

Task:
Create Assessment Result Page

Branch:
phase10/P10-062-mobile-result-page

Priority:
P0

Description:
Display backend-approved score, status, feedback, and breakdown.

Goal:
Show result without local calculation.

Expected output:
Result UI

Dependencies:
P10-038, P10-061

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-062.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-062:".

Done Test:
- Expected output exists: Result UI
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-062

Files created/updated:
- ...

Branch:
phase10/P10-062-mobile-result-page

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-063

Task: Create Result History Page

Branch:
phase10/P10-063-mobile-result-history-page

Priority:
P1

Description:
Display previous attempts/results.

Goal:
Support review and progress awareness.

Expected output:
History UI

Dependencies:
P10-040, P10-062

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-063 only.

Task:
Create Result History Page

Branch:
phase10/P10-063-mobile-result-history-page

Priority:
P1

Description:
Display previous attempts/results.

Goal:
Support review and progress awareness.

Expected output:
History UI

Dependencies:
P10-040, P10-062

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-063.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-063:".

Done Test:
- Expected output exists: History UI
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-063

Files created/updated:
- ...

Branch:
phase10/P10-063-mobile-result-history-page

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-064

Task: Create Deadline Status Widgets

Branch:
phase10/P10-064-mobile-deadline-status-widgets

Priority:
P1

Description:
Add reusable status cards/badges for due/open/closed/late/missed.

Goal:
Standardize deadline display.

Expected output:
Flutter widgets

Dependencies:
P10-056

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-064 only.

Task:
Create Deadline Status Widgets

Branch:
phase10/P10-064-mobile-deadline-status-widgets

Priority:
P1

Description:
Add reusable status cards/badges for due/open/closed/late/missed.

Goal:
Standardize deadline display.

Expected output:
Flutter widgets

Dependencies:
P10-056

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-064.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-064:".

Done Test:
- Expected output exists: Flutter widgets
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-064

Files created/updated:
- ...

Branch:
phase10/P10-064-mobile-deadline-status-widgets

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-065

Task: Add Mobile No Local Grading Tests

Branch:
phase10/P10-065-mobile-no-local-grading-tests

Priority:
P0

Description:
Ensure Flutter does not calculate score/correctness/pass/fail.

Goal:
Protect backend authority.

Expected output:
Flutter tests

Dependencies:
P10-058..P10-062

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-065 only.

Task:
Add Mobile No Local Grading Tests

Branch:
phase10/P10-065-mobile-no-local-grading-tests

Priority:
P0

Description:
Ensure Flutter does not calculate score/correctness/pass/fail.

Goal:
Protect backend authority.

Expected output:
Flutter tests

Dependencies:
P10-058..P10-062

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-065.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-065:".

Done Test:
- Expected output exists: Flutter tests
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-065

Files created/updated:
- ...

Branch:
phase10/P10-065-mobile-no-local-grading-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-066

Task: Add Mobile API Error State Tests

Branch:
phase10/P10-066-mobile-api-error-tests

Priority:
P1

Description:
Test expired, unavailable, unauthorized, duplicate submission states.

Goal:
Improve reliability.

Expected output:
Flutter tests

Dependencies:
P10-061, P10-047

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-066 only.

Task:
Add Mobile API Error State Tests

Branch:
phase10/P10-066-mobile-api-error-tests

Priority:
P1

Description:
Test expired, unavailable, unauthorized, duplicate submission states.

Goal:
Improve reliability.

Expected output:
Flutter tests

Dependencies:
P10-061, P10-047

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-066.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-066:".

Done Test:
- Expected output exists: Flutter tests
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-066

Files created/updated:
- ...

Branch:
phase10/P10-066-mobile-api-error-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-067

Task: Add Mobile Assessment Navigation Tests

Branch:
phase10/P10-067-mobile-assessment-navigation-tests

Priority:
P1

Description:
Test list → detail → attempt → result flows.

Goal:
Verify UX flow.

Expected output:
Flutter tests

Dependencies:
P10-054..P10-062

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-067 only.

Task:
Add Mobile Assessment Navigation Tests

Branch:
phase10/P10-067-mobile-assessment-navigation-tests

Priority:
P1

Description:
Test list → detail → attempt → result flows.

Goal:
Verify UX flow.

Expected output:
Flutter tests

Dependencies:
P10-054..P10-062

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-067.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-067:".

Done Test:
- Expected output exists: Flutter tests
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-067

Files created/updated:
- ...

Branch:
phase10/P10-067-mobile-assessment-navigation-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-068

Task: Add Mobile Deadline Display Tests

Branch:
phase10/P10-068-mobile-deadlines-tests

Priority:
P1

Description:
Test open, upcoming, closed, missed, late deadline UI.

Goal:
Verify deadline UI.

Expected output:
Flutter tests

Dependencies:
P10-056, P10-064

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-068 only.

Task:
Add Mobile Deadline Display Tests

Branch:
phase10/P10-068-mobile-deadlines-tests

Priority:
P1

Description:
Test open, upcoming, closed, missed, late deadline UI.

Goal:
Verify deadline UI.

Expected output:
Flutter tests

Dependencies:
P10-056, P10-064

Scope:
Flutter mobile assessment UI/client task. Consume backend APIs only. No local grading or deadline authority.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-068.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-068:".

Done Test:
- Expected output exists: Flutter tests
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-068

Files created/updated:
- ...

Branch:
phase10/P10-068-mobile-deadlines-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-069

Task: Integrate Assessment Results with Progress Pipeline

Branch:
phase10/P10-069-assessment-progress-integration

Priority:
P0

Description:
Feed backend-approved quiz/exam outcomes into progress/AIM pipeline if appropriate.

Goal:
Connect assessment outcomes to learning state safely.

Expected output:
Backend integration

Dependencies:
P10-029, P5-086

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-069 only.

Task:
Integrate Assessment Results with Progress Pipeline

Branch:
phase10/P10-069-assessment-progress-integration

Priority:
P0

Description:
Feed backend-approved quiz/exam outcomes into progress/AIM pipeline if appropriate.

Goal:
Connect assessment outcomes to learning state safely.

Expected output:
Backend integration

Dependencies:
P10-029, P5-086

Scope:
Integration/review/handoff task. Prove backend authority and no-client-authority compliance.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-069.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-069:".

Done Test:
- Expected output exists: Backend integration
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-069

Files created/updated:
- ...

Branch:
phase10/P10-069-assessment-progress-integration

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-070

Task: Add Assessment Progress Integration Tests

Branch:
phase10/P10-070-assessment-progress-integration-tests

Priority:
P0

Description:
Verify only backend-approved results affect progress/AIM.

Goal:
Prevent client-controlled progress updates.

Expected output:
Backend tests

Dependencies:
P10-069

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-070 only.

Task:
Add Assessment Progress Integration Tests

Branch:
phase10/P10-070-assessment-progress-integration-tests

Priority:
P0

Description:
Verify only backend-approved results affect progress/AIM.

Goal:
Prevent client-controlled progress updates.

Expected output:
Backend tests

Dependencies:
P10-069

Scope:
Integration/review/handoff task. Prove backend authority and no-client-authority compliance.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-070.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-070:".

Done Test:
- Expected output exists: Backend tests
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-070

Files created/updated:
- ...

Branch:
phase10/P10-070-assessment-progress-integration-tests

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-071

Task: Create Assessment Security Review

Branch:
phase10/P10-071-assessment-security-review

Priority:
P0

Description:
Review permissions, leakage, attempts, deadlines, grading, logs, secrets.

Goal:
Validate security readiness.

Expected output:
docs/quality/phase-10-assessment-security-review.md

Dependencies:
P10-045, P10-046, P10-070

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-071 only.

Task:
Create Assessment Security Review

Branch:
phase10/P10-071-assessment-security-review

Priority:
P0

Description:
Review permissions, leakage, attempts, deadlines, grading, logs, secrets.

Goal:
Validate security readiness.

Expected output:
docs/quality/phase-10-assessment-security-review.md

Dependencies:
P10-045, P10-046, P10-070

Scope:
Integration/review/handoff task. Prove backend authority and no-client-authority compliance.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-071.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-071:".

Done Test:
- Expected output exists: docs/quality/phase-10-assessment-security-review.md
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-071

Files created/updated:
- ...

Branch:
phase10/P10-071-assessment-security-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-072

Task: Create Assessment Architecture Review

Branch:
phase10/P10-072-assessment-architecture-review

Priority:
P0

Description:
Review backend/mobile architecture and phase boundaries.

Goal:
Validate maintainability.

Expected output:
docs/quality/phase-10-assessment-architecture-review.md

Dependencies:
P10-071

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-072 only.

Task:
Create Assessment Architecture Review

Branch:
phase10/P10-072-assessment-architecture-review

Priority:
P0

Description:
Review backend/mobile architecture and phase boundaries.

Goal:
Validate maintainability.

Expected output:
docs/quality/phase-10-assessment-architecture-review.md

Dependencies:
P10-071

Scope:
Integration/review/handoff task. Prove backend authority and no-client-authority compliance.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-072.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-072:".

Done Test:
- Expected output exists: docs/quality/phase-10-assessment-architecture-review.md
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-072

Files created/updated:
- ...

Branch:
phase10/P10-072-assessment-architecture-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-073

Task: Create No Client Authority Review

Branch:
phase10/P10-073-no-client-authority-review

Priority:
P0

Description:
Prove Flutter does not own grading, scoring, deadlines, or AIM decisions.

Goal:
Final authority validation.

Expected output:
docs/quality/phase-10-no-client-authority-review.md

Dependencies:
P10-065, P10-070

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-073 only.

Task:
Create No Client Authority Review

Branch:
phase10/P10-073-no-client-authority-review

Priority:
P0

Description:
Prove Flutter does not own grading, scoring, deadlines, or AIM decisions.

Goal:
Final authority validation.

Expected output:
docs/quality/phase-10-no-client-authority-review.md

Dependencies:
P10-065, P10-070

Scope:
Integration/review/handoff task. Prove backend authority and no-client-authority compliance.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-073.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-073:".

Done Test:
- Expected output exists: docs/quality/phase-10-no-client-authority-review.md
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-073

Files created/updated:
- ...

Branch:
phase10/P10-073-no-client-authority-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-074

Task: Create Phase 10 Output Completeness Review

Branch:
phase10/P10-074-output-completeness-review

Priority:
P0

Description:
Verify all Phase 10 outputs exist and meet scope.

Goal:
Approve or block Phase 10 completion.

Expected output:
docs/quality/phase-10-output-completeness-review.md

Dependencies:
P10-071, P10-072, P10-073

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-074 only.

Task:
Create Phase 10 Output Completeness Review

Branch:
phase10/P10-074-output-completeness-review

Priority:
P0

Description:
Verify all Phase 10 outputs exist and meet scope.

Goal:
Approve or block Phase 10 completion.

Expected output:
docs/quality/phase-10-output-completeness-review.md

Dependencies:
P10-071, P10-072, P10-073

Scope:
Integration/review/handoff task. Prove backend authority and no-client-authority compliance.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-074.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-074:".

Done Test:
- Expected output exists: docs/quality/phase-10-output-completeness-review.md
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-074

Files created/updated:
- ...

Branch:
phase10/P10-074-output-completeness-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-075

Task: Create Phase 11 Readiness Checklist

Branch:
phase10/P10-075-phase-11-readiness-checklist

Priority:
P1

Description:
Identify what Admin Dashboard needs to manage quizzes/exams later.

Goal:
Prepare Phase 11 without implementing Admin UI now.

Expected output:
docs/phase-11/readiness-from-phase-10.md

Dependencies:
P10-074

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-075 only.

Task:
Create Phase 11 Readiness Checklist

Branch:
phase10/P10-075-phase-11-readiness-checklist

Priority:
P1

Description:
Identify what Admin Dashboard needs to manage quizzes/exams later.

Goal:
Prepare Phase 11 without implementing Admin UI now.

Expected output:
docs/phase-11/readiness-from-phase-10.md

Dependencies:
P10-074

Scope:
Integration/review/handoff task. Prove backend authority and no-client-authority compliance.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-075.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-075:".

Done Test:
- Expected output exists: docs/phase-11/readiness-from-phase-10.md
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-075

Files created/updated:
- ...

Branch:
phase10/P10-075-phase-11-readiness-checklist

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...


#P10-076

Task: Create Phase 10 Final Review and Handoff

Branch:
phase10/P10-076-phase-10-final-review

Priority:
P0

Description:
Summarize implementation, limitations, risks, outputs, and next steps.

Goal:
Close Phase 10.

Expected output:
docs/phase-10/final-review.md

Dependencies:
P10-075

AgentPrompt:
You are an AI coding/documentation agent working on AIM Platform Phase 10 — Quizzes, Exams, and Deadlines.

Work on task P10-076 only.

Task:
Create Phase 10 Final Review and Handoff

Branch:
phase10/P10-076-phase-10-final-review

Priority:
P0

Description:
Summarize implementation, limitations, risks, outputs, and next steps.

Goal:
Close Phase 10.

Expected output:
docs/phase-10/final-review.md

Dependencies:
P10-075

Scope:
Integration/review/handoff task. Prove backend authority and no-client-authority compliance.

Global Phase 10 rules:
- Backend is the final authority for quiz/exam/deadline/attempt/grading/result decisions.
- Flutter may collect answers and display backend-approved results only.
- Flutter must not calculate correctness, score, pass/fail, deadline validity, late penalty, attempt eligibility, mastery, weakness, recommendations, review schedule, or AIM outputs.
- Do not add AI Teacher, payments, parent dashboard, voice AI, or admin UI unless this exact task explicitly asks for preparation documentation only.
- Do not commit secrets, service-role keys, database credentials, AI provider keys, or production tokens.

Requirements:
- Verify dependency outputs exist before editing.
- Create or update only files needed for P10-076.
- Keep implementation inside the existing AIM architecture.
- Add tests when executable code changes.
- Run relevant checks or document why checks cannot run.
- Commit with a message starting with "P10-076:".

Done Test:
- Expected output exists: docs/phase-10/final-review.md
- Task scope is respected.
- Backend authority is preserved.
- No client-side assessment authority is introduced.
- No unrelated phase work is introduced.
- No secrets are present.
- Relevant checks pass or are documented.

Completion Comment Template:
Completed — P10-076

Files created/updated:
- ...

Branch:
phase10/P10-076-phase-10-final-review

Commits:
- <commit hash> — <message>

Checks:
- ...

Assessment validation:
- Backend grading authority preserved: yes/no/not applicable
- Backend deadline authority preserved: yes/no/not applicable
- No client-side score/correctness calculation: yes/no/not applicable
- No direct Flutter AIM/progress mutation: yes/no/not applicable
- API permissions preserved: yes/no/not applicable
- Secrets excluded: yes/no

Limitations:
- ...

