# AIM Analytics and Reports Scope

## Purpose

This document defines the scope of analytics and reports for the AIM platform MVP. It specifies what is reported, to whom, at what granularity, and what must not be surfaced for each audience — student, parent/guardian, pilot admin, and internal AIM analysis. It is the planning reference for backend reporting logic, admin dashboard views, and mobile app progress screens in Phase 1.

## Scope

Phase 0 planning documentation only. No backend code, report generation logic, dashboard implementation, database queries, Flutter code, or data export pipelines are produced here. All data field references map to `docs/data/session-data-capture.md` and `docs/data/initial-data-model.md`.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-005 | `docs/journeys/student-journey.md` | Present. Defines what feedback and progress the student sees during and after sessions. |
| P0-007 | `docs/journeys/admin-journey.md` | Present. Defines what the pilot admin monitors and exports. |
| P0-015 | `docs/data/session-data-capture.md` | Present. Defines the raw data fields that feed all analytics. |
| P0-016 | `docs/data/initial-data-model.md` | Present. Defines the entities and relationships all reports query. |

---

## Audience Overview

| Audience | Report Type | Delivery Surface | Learner-Safe Rules Apply |
|---|---|---|---|
| Student | Self-progress report | Mobile app progress screen | Yes — no raw behavioral data, no diagnostic labels |
| Parent / Guardian | Child progress summary | Mobile app (parent view), conditional MVP | Yes — summary only, no attempt-level detail |
| Pilot Admin | Cohort and individual reports | Admin dashboard + export | Internal use only — full operational data |
| AIM Engine (internal) | Recommendation outcome tracking | Backend internal, not a user-facing report | N/A — feeds Phase 3 ML training |

---

## Report 1 — Student Progress Report

### Purpose

Give the student a clear, motivating, and learner-safe view of their progress without exposing raw AIM internals or behavioral diagnostics.

### Delivery

- Mobile app **Progress screen**, updated after each completed session.
- Available on demand at any time via `GET /students/me/progress`.

### Contents

| Section | Fields Shown | Source Entity |
|---|---|---|
| **Overview** | Lessons completed, total study time (formatted as "X hours Y minutes"), days active, current streak | `LearningSession`, `StudentProfile` |
| **Skill Progress** | Per-skill: skill name, learner-safe mastery level label (see below), last practiced date | `StudentSkillState` |
| **Recent Sessions** | Last 5 sessions: lesson title, date, completion status, brief result summary | `LearningSession` |
| **Next Recommended Step** | Learner-safe message from AIM recommendation (e.g., "Keep practising Present Perfect") | `AIMRecommendation.learner_message` |
| **Goals** | Current daily, weekly, and monthly micro-goals with achieved/not achieved status | `MicroGoal` |
| **Review Needs** | Skills flagged as due for review ("Time to refresh: Present Simple") | `ReviewSchedule.is_due` |

### Mastery Level Labels (Learner-Safe Translation)

Raw mastery scores (`0.0–1.0`) must never be shown to students. They are translated to labels:

| Raw Mastery Range | Label Shown to Student |
|---|---|
| 0.0 – 0.29 | "Just getting started" |
| 0.30 – 0.49 | "Building foundations" |
| 0.50 – 0.69 | "Making progress" |
| 0.70 – 0.84 | "Good understanding" |
| 0.85 – 1.00 | "Strong grasp" |

### What Must NOT Appear in Student Reports

| Excluded Field | Reason |
|---|---|
| `mastery` (raw float) | Must use label translation only |
| `frustration_score` | Clinical / diagnostic risk |
| `weakness_score` | May discourage; use recommendation message instead |
| `forgetting_lambda` | Internal AIM parameter |
| `hesitation_index` | Raw behavioral signal |
| `avg_speed` | Response time must not be framed as a performance metric |
| `prerequisite_gap_flag` | Surfaced as a recommendation, not a flag |
| Other students' data | Privacy |
| AIM audit log details | Internal only |

---

## Report 2 — Parent / Guardian Progress Summary

### Purpose

Give a linked parent or guardian a high-level, reassuring, and privacy-respecting view of their child's learning activity. Conditional for MVP — included only if the project owner approves parent access per `docs/product/roles-and-permissions.md`.

### Delivery

- Mobile app **Parent view** (linked child's progress tab).
- Optionally: scheduled weekly summary notification if notification scope includes it.

### Contents

| Section | Fields Shown | Source Entity |
|---|---|---|
| **Activity This Week** | Sessions completed, total study time this week, days active | `LearningSession` |
| **Skill Progress Summary** | Up to 5 skills: skill name, label (same learner-safe labels as student view), trend (improving / stable / needs attention) | `StudentSkillState` |
| **Current Focus** | The skill the student is currently working on and the next recommended lesson type | `AIMRecommendation`, `StudentSkillState` |
| **Review Reminder** | Whether any skills are currently due for review | `ReviewSchedule.is_due` |
| **Encouragement Signal** | If student is achieving goals or on a streak, surface a positive message. If frustration is high (internal signal only), surface "Your child may benefit from a short break." without exposing the score. | `MicroGoal.is_achieved`, `SessionBehavioralSignal.frustration_score_contribution` |

### What Must NOT Appear in Parent Reports

| Excluded Field | Reason |
|---|---|
| Raw mastery floats | Use labels only |
| `frustration_score` | Never surfaced as a score to any non-internal user |
| Attempt-level detail | Too granular; privacy risk |
| Other learners' data | Privacy |
| AIM audit internals | Internal only |
| Clinical or diagnostic language | AIM is educational only |

---

## Report 3 — Pilot Admin Cohort Report

### Purpose

Give the pilot admin a full operational view of the cohort to support monitoring, issue detection, content triage, and pilot closeout.

### Delivery

- Admin dashboard **Cohort Overview** page.
- Filterable by student, date range, skill, and session type.
- Exportable as structured JSON or CSV for pilot analysis.

### Contents

#### 3a — Cohort Summary Panel

| Metric | Description | Source |
|---|---|---|
| Total students | Count of enrolled pilot students | `StudentProfile` |
| Placement complete | Count with `is_placement_complete = true` | `StudentProfile` |
| Sessions completed | Total completed sessions across all students | `LearningSession` |
| Sessions abandoned | Total abandoned sessions | `LearningSession` |
| Avg session duration | Mean `total_time_seconds` across completed sessions | `LearningSession` |
| Avg mastery (all skills) | Mean mastery across all `StudentSkillState` records | `StudentSkillState` |
| Band distribution | Count of students per placement band | `StudentProfile.placement_band` |
| Top 3 weakest skills | Skills with highest average `weakness_score` across cohort | `StudentSkillState` |
| Top 3 strongest skills | Skills with highest average mastery across cohort | `StudentSkillState` |
| Recommendation distribution | Count of each `action_type` issued in the period | `AIMRecommendation` |
| Recommendation follow rate | `was_followed = true` / total recommendations | `AIMRecommendation` |
| Frustration rate | Count of sessions with `frustration_score_contribution > 0.7` / total sessions | `SessionBehavioralSignal` |

#### 3b — Individual Student Report

Available by drilling into any student from the cohort list.

| Section | Fields | Source |
|---|---|---|
| **Profile** | Display name, band, enrollment date, placement complete flag, last active | `StudentProfile` |
| **Full Skill State** | All `StudentSkillState` fields including `mastery`, `confidence`, `frustration_score`, `weakness_score`, `forgetting_lambda`, `learning_style`, `prerequisite_gap_flag` | `StudentSkillState` |
| **Session History** | All sessions: lesson title, type, status, duration, questions answered, early exit flag, AI Teacher invocations, remediation triggered | `LearningSession` |
| **Recommendation History** | All recommendations: action type, reason, was followed, mastery before/after | `AIMRecommendation` |
| **Behavioral Signal Summary** | Per session: hesitation index, sudden slowdown flag, repeated errors flag, frustration contribution | `SessionBehavioralSignal` |
| **Review Schedule** | All skills with review dates, is_due status, completed status | `ReviewSchedule` |
| **Remediation Triggers** | Any triggered remediations: skill, weakness score at trigger, resolved status | `RemediationTrigger` |
| **Micro-Goals** | All goals: type, skill, text, achieved status, target date | `MicroGoal` |
| **Admin Overrides** | Any overrides applied: action, skill/lesson target, reason, applied at | `AdminOverride` |

#### 3c — Content Quality Report

| Section | Fields | Source |
|---|---|---|
| **Unresolved Flags** | Question ID, flag type, raised at, raised by | `ContentQualityFlag` |
| **Question Error Clusters** | Questions with `common_error_tag` appearing in > 40% of attempts | `QuestionAttempt` |
| **High Skip Rate Questions** | Questions skipped > 30% of times served | `QuestionAttempt` |
| **Low Quality Sessions** | Sessions with `session_quality_flag = true` | `LearningSession` |

#### 3d — Audit Log View

Scoped read-only view of `AuditLog` entries.

| Filter Available | Description |
|---|---|
| By `action` | e.g., `admin.aim_override.applied`, `aim.recommendation.generated` |
| By `entity_type` | e.g., `LearningSession`, `StudentSkillState` |
| By `actor_user_id` | Filter to specific admin or system |
| By date range | `occurred_at` window |

Audit log entries shown without `before_state` / `after_state` raw JSON in the default view. Full detail available on expand for `project_owner` only.

---

## Report 4 — AIM Recommendation Outcome Tracking (Internal)

### Purpose

Track whether AIM Engine recommendations resulted in mastery improvement. This is the primary data feed for Phase 3 ML model training. It is not a user-facing report — it is a backend-internal analytics dataset.

### Data Captured

Per `AIMRecommendation` entity (from `docs/data/initial-data-model.md`):

| Field | Description |
|---|---|
| `action_type` | The recommendation action issued |
| `recommendation_reason` | Why the recommendation was made |
| `was_followed` | Whether the student started the recommended lesson |
| `mastery_before` | Student mastery for the primary skill at time of recommendation |
| `mastery_after` | Student mastery after the next two follow-up sessions (populated async) |
| `outcome_tracked_at` | When the outcome was captured |

### Success Label Rule (for Phase 3 ML)

A recommendation is labelled **SUCCESS** if:
`mastery_after > mastery_before + 0.05` (5 percentage points improvement)

A recommendation is labelled **FAILURE** otherwise.

This labelling logic matches the Phase 3 ML pipeline specification in the AIM Task Breakdown (T-12).

### Internal Analytics Derived From This Data

| Metric | Description |
|---|---|
| Follow rate by action type | Which action types students actually start |
| Mastery improvement rate by action type | Which action types produce mastery gains |
| Follow rate vs. improvement correlation | Whether following a recommendation predicts improvement |
| Recommendation confidence vs. outcome | Whether `confidence_score` predicts success |

These metrics are available in `GET /admin/reports/aim-recommendations` (admin dashboard) and as a backend export for ML pipeline use.

---

## Report Delivery Summary

| Report | On-Demand | Scheduled / Auto | Export Format |
|---|---|---|---|
| Student progress report | Yes (any time) | Refreshed after each session | API JSON (mobile renders it) |
| Parent progress summary | Yes (any time) | Weekly notification (if enabled) | API JSON |
| Admin cohort summary | Yes | Daily refresh at midnight UTC | API JSON + CSV export |
| Admin individual report | Yes | Real-time (live data) | API JSON + CSV export |
| Admin content quality | Yes | Flagged items appear in real time | API JSON |
| Admin audit log | Yes | Append-only, always current | API JSON |
| AIM outcome tracking | Backend internal | Populated async after 2 follow-up sessions | Backend dataset / CSV for ML |

---

## Learner-Safe Rules (Global)

These rules apply to all user-facing reports regardless of audience:

| Rule | Detail |
|---|---|
| No raw mastery floats to students or parents | Use label translations only |
| No `frustration_score` to students or parents | Internal behavioral signal only |
| No clinical or diagnostic language | AIM detects behavioral patterns for educational adaptation, not diagnosis |
| No response time as a performance metric | Never frame speed as a measure of intelligence or mastery |
| No cross-student data in student or parent views | Each student sees only their own data |
| No raw AIM audit internals to students or parents | Internal operational data only |
| Admin data is for operations, not profiling | Admin reports support the pilot; they must not be repurposed for external profiling |

---

## MVP Report Boundaries

### In Scope for MVP

- Student progress screen (mobile).
- Parent summary view (conditional, if project owner approves).
- Admin cohort and individual student reports.
- Admin content quality flag queue.
- Admin recommendation outcome summary.
- Admin scoped audit log view.
- AIM internal outcome tracking dataset.

### Out of Scope for MVP

| Deferred Item | Reason |
|---|---|
| Real-time live dashboard (WebSocket / push) | Post-MVP. MVP uses scheduled refresh and on-demand fetch. |
| PDF report generation | Post-MVP. MVP serves JSON that admin can export to CSV. |
| Automated parent email reports | Post-MVP. Depends on notification scope (P0-020). |
| Teacher-level class reports | No teacher role in MVP pilot. |
| School or organisation-level rollups | No multi-tenant support in MVP. |
| A/B test reporting for ML | Phase 3 only (T-12). |
| Custom report builder | Post-MVP admin feature. |

---

## Non-Goals

- This document does not implement report generation code.
- This document does not define SQL queries or ORM report logic.
- This document does not create a Student Web App.
- This document does not create Flutter reporting widgets.
- This document does not define data warehouse or BI tool integration.
- This document does not move AIM Engine logic into any client.

---

## Assumptions

- All report data is sourced from the backend database using entities defined in `docs/data/initial-data-model.md`.
- `ProgressReport` snapshots are pre-generated at session end and cached. They are not computed live per mobile request.
- Admin CSV export is acceptable for pilot analysis. A full BI integration is post-MVP.
- The AIM outcome tracking dataset is populated by a backend async job that runs after two follow-up sessions complete for a given recommendation.
- Parent summary is conditional: it is only built if the project owner confirms parent access is in MVP scope.

---

## Open Questions

| Question | Current Handling |
|---|---|
| Should the student see a raw streak count ("7-day streak") or a label ("Great consistency this week")? | Recommend label for MVP — motivating without over-gamifying. Engineering decides exact wording. |
| Should mastery trend (improving / stable / declining) be surfaced in the student view? | Useful but adds complexity. Defer to frontend planning unless the team agrees it's essential for the pilot. |
| Should the admin cohort export include identifiable learner data (display names) or anonymised IDs only? | Default to anonymised export for any data leaving the admin dashboard. Security/privacy task (P0-022) should confirm. |
| At what point is the AIM outcome tracking label populated — strictly 2 sessions, or also time-bounded (e.g., 7 days)? | Currently defined as 2 sessions. Add a time ceiling (e.g., 30 days) as a fallback for learners who pause. Open for Phase 3 ML team to decide. |
| Does the parent weekly summary require a separate notification system, or is it pull-only? | Pull-only (on-demand API) for MVP. Push notification requires P0-020 notification scope to be finalised first. |

---

## Related Documents

- `docs/journeys/student-journey.md` — Student progress and feedback flow this report serves.
- `docs/journeys/admin-journey.md` — Admin monitoring and export workflows this report enables.
- `docs/data/session-data-capture.md` — Raw data fields feeding all analytics.
- `docs/data/initial-data-model.md` — Entity model all reports query.
- `docs/product/roles-and-permissions.md` — Who may access which report sections.
- `docs/api/api-planning-baseline.md` — API endpoints delivering these reports (`/students/me/progress`, `/admin/reports/*`).
- `docs/security/ai-safety-privacy-rules.md` (P0-022) — Data minimization and learner-safe rules this scope must follow.

---

## Acceptance Notes

- Dependencies checked: P0-005, P0-007, P0-015, P0-016 — all output files present and meaningful.
- This document defines 4 report audiences, their contents, delivery surfaces, and learner-safe exclusion rules.
- MVP scope and out-of-scope boundaries are explicit.
- AIM outcome tracking and Phase 3 ML labelling rule are included.
- No runtime code, dashboard implementation, Flutter widgets, SQL queries, or AIM Engine code was added.
- Task is ready to mark Done in Notion.
