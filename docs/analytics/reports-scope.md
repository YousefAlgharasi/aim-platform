# AIM Analytics and Reports Scope

## Purpose

This document defines the scope of analytics and reports for AIM. It specifies what is reported, to whom, at what granularity, and what must not be surfaced for each audience.

It is the planning reference for backend reporting logic, admin/internal reporting views, and Flutter Mobile learner progress screens in post-MVP Phase 1.

## Scope

This is Phase 0 planning documentation only.

This document does not implement:

- Backend report generation code.
- NestJS API code.
- FastAPI routes.
- SQL queries.
- ORM report logic.
- Flutter Mobile widgets.
- React Web code.
- Dashboard implementation.
- Data export pipelines.
- AIM Engine code.
- A separate Student Web App.

All data field references should map to `docs/data/session-data-capture.md` and `docs/data/initial-data-model.md`.

## Current Product Direction

| Area | Confirmed Direction |
|---|---|
| Completed MVP pilot learner interface | React Web |
| Completed MVP pilot backend API | FastAPI |
| Completed MVP pilot AIM Engine | Python backend AIM Engine |
| Completed MVP pilot database | Supabase PostgreSQL |
| Completed MVP pilot auth | Supabase Auth |
| Post-MVP Phase 1 learner client | Flutter Mobile |
| Post-MVP Phase 1 Backend API | NestJS + TypeScript |
| Post-MVP Phase 1 AIM Engine | Python AIM Engine as a backend service/module |
| Post-MVP Phase 1 database/auth | Supabase PostgreSQL/Auth unless changed by a later documented decision |
| Post-MVP Student Web App | No separate Student Web App is planned unless a later documented product decision changes this |

## Phase Clarification

The completed MVP pilot used React Web and FastAPI.

Post-MVP Phase 1 uses Flutter Mobile and NestJS + TypeScript.

Analytics and reporting must support the post-MVP Flutter Mobile learner client and admin/internal surfaces. React Web references are historical completed-pilot context only unless a later documented decision creates a specific retained internal surface.

No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for reporting safety and client boundary rules. |
| P0-005 | `docs/journeys/student-journey.md` | Checked for learner progress and feedback flow. |
| P0-007 | `docs/journeys/admin-journey.md` | Checked for admin monitoring and export workflows. |
| P0-015 | `docs/data/session-data-capture.md` | Checked for raw data fields feeding analytics. |
| P0-016 | `docs/data/initial-data-model.md` | Checked for report entities and relationships. |
| P0-017 | `docs/api/api-planning-baseline.md` | Checked for report API delivery surfaces. |
| P0-022 | `docs/security/ai-safety-privacy-rules.md` | Checked for privacy, minimization, and learner-safe rules. |

## Audience Overview

| Audience | Report Type | Delivery Surface | Learner-Safe Rules Apply |
|---|---|---|---|
| Student | Self-progress report | Flutter Mobile Progress screen | Yes |
| Parent / Guardian | Child progress summary | Conditional parent view, if approved | Yes, summary only |
| Admin / Internal Operator | Cohort and individual reports | Admin/internal reporting surface | Internal role-restricted data |
| AIM Engine / Data Analysis | Recommendation outcome tracking | Backend internal dataset | Not user-facing |

## Global Reporting Rules

All reports must preserve these rules:

- AIM Engine logic remains Python/backend-owned.
- Reports must not move AIM calculations into Flutter Mobile, React Web, admin UI, or any client.
- Reports must not let clients calculate mastery, student level, weakness, difficulty, retention, or recommendations locally.
- AI Teacher Gateway remains backend-only.
- AI provider keys and privileged backend credentials must never appear in reports.
- Speed, response time, average response time, and speed score must not directly affect mastery, student level, or direct difficulty increase.
- Speed may only appear as educational behavior evidence for authorized internal analysis.
- Student and parent reports must use educational, non-clinical, non-medical, and non-diagnostic language.
- Admin reports are for operations and quality, not for clinical profiling.
- Cross-student data must never appear in student or parent views.

## Report 1 — Student Progress Report

### Purpose

Give the learner a clear, motivating, and learner-safe view of progress without exposing raw AIM internals, hidden behavioral scores, diagnostic language, or raw scoring formulas.

### Delivery

- Flutter Mobile Progress screen.
- Available on demand through the Backend API.
- Refreshed after completed sessions using backend-approved progress snapshots.

### Contents

| Section | Fields Shown | Source Entity |
|---|---|---|
| Overview | Lessons completed, study time, active days, current streak if approved | `LearningSession`, `StudentProfile` |
| Skill Progress | Skill name, learner-safe mastery label, last practiced date | `StudentSkillState` |
| Recent Sessions | Last sessions, lesson title, date, completion status, brief safe summary | `LearningSession` |
| Next Recommended Step | Learner-safe backend recommendation message | `AIMRecommendation.learner_message` |
| Goals | Current daily/weekly/monthly goals and achieved status | `MicroGoal` |
| Review Needs | Skills due for review in safe wording | `ReviewSchedule` |

### Mastery Label Translation

Raw mastery scores must not be shown directly to students.

| Raw Mastery Range | Label Shown to Student |
|---|---|
| `0.00` to `0.29` | Just getting started |
| `0.30` to `0.49` | Building foundations |
| `0.50` to `0.69` | Making progress |
| `0.70` to `0.84` | Good understanding |
| `0.85` to `1.00` | Strong grasp |

### Student Report Exclusions

| Excluded Field | Reason |
|---|---|
| Raw `mastery` float | Use learner-safe label translation only. |
| `frustration_score` | Internal educational behavior signal; diagnostic risk if exposed. |
| Raw `weakness_score` | May discourage learners; use safe recommendation messages instead. |
| `forgetting_lambda` | Internal AIM parameter. |
| `hesitation_index` | Raw behavioral signal. |
| `avg_speed` | Response time must not be framed as performance, intelligence, or mastery. |
| `prerequisite_gap_flag` | Surface as safe review/recommendation wording, not a raw flag. |
| Other students' data | Privacy boundary. |
| AIM audit log details | Internal only. |
| AI provider prompts or raw responses | Backend/internal only. |

## Report 2 — Parent / Guardian Progress Summary

### Purpose

Give a linked parent or guardian a high-level, reassuring, and privacy-respecting view of the learner's activity if parent access is approved.

Parent reporting is conditional. It must not be implemented until consent, linking, data visibility, and privacy rules are explicitly approved.

### Delivery

- Conditional parent view if approved.
- Optional weekly summary only if notification scope approves safe payloads.
- No parent report is required if parent access is deferred.

### Contents

| Section | Fields Shown | Source Entity |
|---|---|---|
| Activity This Week | Sessions completed, study time, days active | `LearningSession` |
| Skill Progress Summary | Up to 5 skills, learner-safe label, trend | `StudentSkillState` |
| Current Focus | Current skill and next recommended lesson type | `AIMRecommendation`, `StudentSkillState` |
| Review Reminder | Whether review is due | `ReviewSchedule` |
| Encouragement Signal | Positive goal/streak message or safe break suggestion | `MicroGoal`, backend-safe behavior summary |

### Parent Report Exclusions

| Excluded Field | Reason |
|---|---|
| Raw mastery floats | Use labels only. |
| `frustration_score` | Never surfaced as a score to non-internal users. |
| Attempt-level detail | Too granular and privacy-sensitive. |
| Other learners' data | Privacy boundary. |
| AIM audit internals | Internal only. |
| Clinical, medical, or diagnostic language | AIM is educational only. |
| AI provider prompts or raw responses | Backend/internal only. |

## Report 3 — Admin / Internal Cohort Report

### Purpose

Give admin/internal operators an operational view of the learner cohort to support monitoring, issue detection, content triage, review workflows, and pilot or Phase 1 analysis.

### Delivery

- Admin/internal reporting surface.
- Filterable by student, date range, skill, and session type.
- Exportable as structured JSON or CSV if approved.
- Role-restricted and audit-aware.

### Cohort Summary

| Metric | Description | Source |
|---|---|---|
| Total students | Count of enrolled students | `StudentProfile` |
| Placement complete | Count with completed placement | `StudentProfile` |
| Sessions completed | Total completed sessions | `LearningSession` |
| Sessions abandoned | Total abandoned sessions | `LearningSession` |
| Average session duration | Mean session duration | `LearningSession` |
| Average mastery | Mean backend-calculated mastery across skills | `StudentSkillState` |
| Band distribution | Count of students per placement band | `StudentProfile` |
| Top weakest skills | Skills with highest backend weakness signals | `StudentSkillState` |
| Top strongest skills | Skills with highest mastery | `StudentSkillState` |
| Recommendation distribution | Count of each backend action type | `AIMRecommendation` |
| Recommendation follow rate | Followed recommendations divided by total recommendations | `AIMRecommendation` |
| High-frustration session rate | Internal operational behavior signal rate | `SessionBehavioralSignal` |

### Individual Student Report

| Section | Fields | Source |
|---|---|---|
| Profile | Display name, band, enrollment date, placement state, last active | `StudentProfile` |
| Skill State | Skill state fields including internal-only fields for authorized roles | `StudentSkillState` |
| Session History | Lessons, status, duration, questions answered, AI Teacher invocations | `LearningSession` |
| Recommendation History | Action type, reason, followed status, mastery before/after | `AIMRecommendation` |
| Behavior Summary | Hesitation, slowdown, repeated errors, frustration contribution | `SessionBehavioralSignal` |
| Review Schedule | Skills, review dates, due state, completed state | `ReviewSchedule` |
| Remediation Triggers | Triggered remediation, status, related skill | `RemediationTrigger` |
| Micro-Goals | Goal type, skill, text, achieved status, target date | `MicroGoal` |
| Admin Overrides | Action, target, reason, applied timestamp | `AdminOverride` |

### Content Quality Report

| Section | Fields | Source |
|---|---|---|
| Unresolved Flags | Question ID, flag type, raised timestamp, raised by | `ContentQualityFlag` |
| Question Error Clusters | Questions with high repeated error patterns | `QuestionAttempt` |
| High Skip Rate Questions | Questions skipped frequently | `QuestionAttempt` |
| Low Quality Sessions | Sessions flagged for low quality | `LearningSession` |

### Audit Log View

Scoped read-only view of `AuditLog` entries.

| Filter | Description |
|---|---|
| `action` | Example: `admin.aim_override.applied`, `aim.recommendation.generated` |
| `entity_type` | Example: `LearningSession`, `StudentSkillState` |
| `actor_user_id` | Specific admin, reviewer, or system actor |
| Date range | `occurred_at` window |

Default audit log views should avoid exposing raw `before_state` and `after_state` JSON. Full detail should be restricted to `project_owner` or an approved equivalent role.

## Report 4 — AIM Recommendation Outcome Tracking

### Purpose

Track whether AIM Engine recommendations produce educational improvement. This is an internal analytics dataset, not a student-facing or parent-facing report.

### Data Captured

| Field | Description |
|---|---|
| `recommendation_id` | Recommendation identifier. |
| `student_id` | Student identifier. |
| `action_type` | Backend recommendation action issued. |
| `recommendation_reason` | Why the recommendation was made. |
| `was_followed` | Whether the learner started the recommended next step. |
| `mastery_before` | Backend mastery before recommendation. |
| `mastery_after` | Backend mastery after follow-up evidence. |
| `outcome_tracked_at` | Timestamp for outcome tracking. |

### Outcome Label Rule

A recommendation may be labelled successful only using backend-approved learning evidence.

Planning default:

```text
SUCCESS if mastery_after > mastery_before + 0.05
FAILURE otherwise
```

This label is internal analytics data. It must not be shown to students or parents.

### Internal Metrics

| Metric | Description |
|---|---|
| Follow rate by action type | Which recommendation action types learners start. |
| Mastery improvement rate by action type | Which action types correlate with later mastery gains. |
| Follow rate vs improvement correlation | Whether following recommendations predicts learning improvement. |
| Recommendation confidence vs outcome | Whether internal confidence predicts success. |

## Report Delivery Summary

| Report | On-Demand | Scheduled / Auto | Export Format |
|---|---|---|---|
| Student progress report | Yes | Refreshed after completed sessions | API JSON rendered by Flutter Mobile |
| Parent progress summary | Conditional | Weekly notification only if approved | API JSON |
| Admin cohort summary | Yes | Scheduled refresh if needed | API JSON and CSV if approved |
| Admin individual report | Yes | Current backend data | API JSON and CSV if approved |
| Admin content quality report | Yes | Flagged items appear when generated | API JSON |
| Admin audit log | Yes | Append-only | API JSON |
| AIM outcome tracking | Backend internal | Populated after follow-up evidence | Backend dataset / CSV if approved |

## Learner-Safe Reporting Rules

These rules apply to all student-facing and parent-facing reports.

| Rule | Detail |
|---|---|
| No raw mastery floats | Use learner-safe labels only. |
| No frustration score | Internal educational behavior signal only. |
| No clinical or diagnostic language | AIM is educational, not medical or diagnostic. |
| No response time as performance metric | Speed must not be framed as intelligence, mastery, or level. |
| No cross-student data | Student/parent views are scoped to their linked learner only. |
| No raw AIM audit internals | Internal operational data only. |
| No provider prompts or secrets | Backend/server-only. |
| No local client calculations | Reports show backend-approved outputs only. |

## Admin Reporting Rules

Admin/internal reports may show more detail, but they must remain controlled.

Admin/internal reports must:

- Be role-restricted.
- Be audit-aware.
- Use educational language.
- Avoid clinical, medical, or diagnostic learner labels.
- Avoid exposing secrets, provider keys, or privileged credentials.
- Treat speed as behavior evidence only.
- Preserve student privacy in exports.
- Use anonymized IDs by default when data leaves the admin surface.

## Report Boundaries

### In Scope

- Flutter Mobile learner progress screen.
- Conditional parent summary view if approved.
- Admin/internal cohort report.
- Admin/internal individual student report.
- Admin/internal content quality report.
- Admin/internal recommendation outcome report.
- Admin/internal scoped audit log view.
- Backend-internal AIM outcome tracking dataset.

### Out of Scope

| Deferred Item | Reason |
|---|---|
| Separate Student Web App reporting surface | No separate post-MVP Student Web App is planned. |
| Real-time live dashboard with WebSocket/push | Later scalability feature. |
| PDF report generation | Later export feature. |
| Automated parent email reports | Requires notification/privacy approval. |
| Teacher-level class reports | Teacher/classroom scope is future expansion. |
| School or organization rollups | Multi-tenant reporting is future expansion. |
| A/B test reporting for ML | Later ML experimentation scope. |
| Custom report builder | Later admin feature. |
| Client-side analytics calculation | Violates backend-owned AIM/reporting boundary. |

## Non-Goals

This document does not:

- Implement report generation code.
- Define final SQL queries or ORM report logic.
- Create a Student Web App.
- Create Flutter reporting widgets.
- Create React Web reporting code.
- Define data warehouse or BI tool integration.
- Move AIM Engine logic into any client.
- Let clients calculate mastery, student level, weakness, difficulty, retention, or recommendations locally.
- Expose AI provider keys or privileged backend credentials.

## Assumptions

- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless a later documented decision changes this.
- All report data is sourced from backend/database entities.
- `ProgressReport` snapshots are generated or approved by backend logic.
- Admin CSV export is acceptable for analysis when privacy controls are applied.
- Parent summary is conditional until approved.
- No separate Student Web App is planned for post-MVP unless a later documented decision changes this.

## Open Questions

| Question | Current Handling |
|---|---|
| Should learners see raw streak count or a softer consistency label? | Prefer safe motivational label unless product chooses exact streak display. |
| Should mastery trend be shown to learners? | Useful but must be learner-safe and backend-approved. |
| Should admin exports include names or anonymized IDs? | Default to anonymized IDs for exported data. |
| When is AIM outcome tracking populated? | Default after two follow-up sessions; time ceiling can be added later. |
| Does parent weekly summary require push notifications? | Pull-only by default. Push requires notification scope approval. |
| Which admin report fields are required for first Phase 1 build? | Define minimum admin scope before implementation. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/journeys/student-journey.md`
- `docs/journeys/admin-journey.md`
- `docs/data/session-data-capture.md`
- `docs/data/initial-data-model.md`
- `docs/product/roles-and-permissions.md`
- `docs/api/api-planning-baseline.md`
- `docs/mobile/mobile-sitemap.md`
- `docs/security/ai-safety-privacy-rules.md`
- `docs/aim-engine/boundary-and-io-contract.md`

## Acceptance Notes

- Dependencies checked: P0-001, P0-005, P0-007, P0-015, P0-016, P0-017, and P0-022.
- This document defines reporting audiences, report contents, delivery surfaces, exclusions, boundaries, assumptions, open questions, and learner-safe rules.
- Completed MVP pilot stack and post-MVP Phase 1 target stack are separated.
- React Web is described as the completed MVP pilot learner interface.
- FastAPI is tied only to the completed MVP pilot backend API.
- Flutter Mobile is described as the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is described as the post-MVP Phase 1 Backend API.
- AIM Engine remains Python/backend-owned.
- AI Teacher Gateway remains backend-only.
- AI provider keys and privileged backend credentials remain backend/server-only.
- Client boundaries remain strict everywhere.
- Speed remains educational behavior evidence only and does not directly affect mastery, student level, or direct difficulty increase.
- Learner behavior language remains educational, non-clinical, non-medical, and non-diagnostic.
- No separate Student Web App is planned for post-MVP unless a later documented decision changes this.
- No runtime source code, Student Web App, Flutter AIM logic, database migration, or backend implementation was added.
