# AIM Initial Data Model and Entity List

## Purpose

This document drafts the initial logical data model for AIM. It defines the core entities, key fields, relationships, access boundaries, and the role each entity plays for identity, learning content, learner sessions, AIM Engine state, analytics, audit, and reporting.

It is the authoritative Phase 0 planning reference for post-MVP Phase 1 database design.

## Scope

This is Phase 0 planning documentation only.

This document does not implement:

- SQL DDL.
- ORM models.
- Database migrations.
- NestJS API code.
- FastAPI routes.
- Flutter Mobile code.
- React Web code.
- Admin dashboard code.
- AIM Engine runtime code.
- AI Teacher Gateway code.
- A separate Student Web App.

Physical implementation decisions such as indexes, partitioning, constraints, row-level security, foreign key enforcement, and migration strategy belong to Phase 1 implementation planning.

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

The completed MVP pilot used React Web, FastAPI, Python backend AIM Engine, Supabase PostgreSQL, and Supabase Auth.

Post-MVP Phase 1 uses Flutter Mobile, NestJS + TypeScript Backend API, Python AIM Engine as a backend service/module, and Supabase PostgreSQL/Auth unless changed by a later documented decision.

This data model supports backend-owned AIM processing. Flutter Mobile, completed React Web pilot surfaces, admin UI surfaces, and any future clients must not calculate mastery, student level, weakness, difficulty, retention, or recommendations locally.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for data/AIM/client guardrails. |
| P0-003 | `docs/product/roles-and-permissions.md` | Present. Role model and access boundaries inform entity ownership and access rules. |
| P0-014 | `docs/aim-engine/boundary-and-io-contract.md` | Checked for AIM Engine state and output entities. |
| P0-015 | `docs/data/session-data-capture.md` | Present. Session data capture fields map to session and attempt entities. |
| P0-017 | `docs/api/api-planning-baseline.md` | Checked for API-facing entity usage. |
| P0-021 | `docs/analytics/reports-scope.md` | Checked for report entities and visibility rules. |
| P0-022 | `docs/security/ai-safety-privacy-rules.md` | Checked for privacy, minimization, and safe-use rules. |

## Data Model Rules

- Supabase PostgreSQL/Auth remain the default database/auth direction unless changed by a later documented decision.
- Entity identifiers should use UUIDs.
- Backend authorization is final.
- Clients must not own authorization, role, or data access decisions.
- AIM Engine state is backend-owned.
- AI Teacher Gateway data and provider credentials are backend-only.
- Student-facing and parent-facing reports must use learner-safe fields only.
- Speed and response time may be stored as educational behavior evidence only.
- Speed, response time, average response time, and speed score must not directly affect mastery, student level, or direct difficulty increase.
- Learner behavior language must remain educational, non-clinical, non-medical, and non-diagnostic.

## Entity Overview

| # | Entity | Category | Planning Status | Description |
|---|---|---|---|---|
| 1 | User | Identity | Phase 1 Foundation | All authenticated platform users across roles. |
| 2 | StudentProfile | Learner | Phase 1 Foundation | Learner-specific data linked to a User. |
| 3 | ParentGuardianLink | Relationship | Conditional | Links a parent/guardian User to one or more learners if parent access is approved. |
| 4 | Skill | Content | Phase 1 Foundation | A learnable English skill unit with prerequisites and metadata. |
| 5 | Lesson | Content | Phase 1 Foundation | Structured learning unit targeting one or more skills. |
| 6 | LessonBlock | Content | Phase 1 Foundation | Individual content or practice block within a Lesson. |
| 7 | Question | Content | Phase 1 Foundation | Practice question in the question bank. |
| 8 | QuestionChoice | Content | Phase 1 Foundation | Selectable answer choice for supported question types. |
| 9 | PlacementTestResult | Assessment | Phase 1 Foundation | Outcome of learner placement test. |
| 10 | LearningSession | Session | Phase 1 Foundation | A single learning session started by a learner. |
| 11 | QuestionAttempt | Attempt | Phase 1 Foundation | One attempt on one question within a session. |
| 12 | SessionBehavioralSignal | Behavior Evidence | Phase 1 Foundation | Derived educational behavior signals computed at session end. |
| 13 | AITeacherInvocation | AI Interaction | Phase 1 Foundation | One AI Teacher help invocation within a session. |
| 14 | StudentSkillState | AIM State | Phase 1 Foundation | AIM Engine per-student, per-skill adaptive state. |
| 15 | AIMRecommendation | AIM Output | Phase 1 Foundation | Next-action recommendation generated by AIM Engine. |
| 16 | RemediationTrigger | AIM Output | Phase 1 Foundation | Event emitted when remediation is needed. |
| 17 | ReviewSchedule | AIM Output | Phase 1 Foundation | Scheduled review need generated by retention logic. |
| 18 | MicroGoal | AIM Output | Phase 1 Foundation | Daily, weekly, or monthly micro-goal. |
| 19 | ContentQualityFlag | Quality | Phase 1 Foundation | Flag for content or data quality review. |
| 20 | AuditLog | Audit | Phase 1 Foundation | Append-only audit trail for significant backend actions. |
| 21 | AdminOverride | Admin | Phase 1 Foundation | Recorded admin override of AIM Engine state or recommendation. |
| 22 | ProgressReport | Reporting | Phase 1 Foundation | Generated learner progress summary snapshot. |

## Entity Definitions

### 1. User

Represents every authenticated account in the platform regardless of role.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | System-generated user identifier. |
| `email` | string unique | Supabase Auth email. Never exposed to other learners. |
| `role` | enum | One of `student`, `pilot_admin`, `content_manager`, `human_reviewer`, `parent_guardian`, `project_owner`, `system_service`. |
| `display_name` | string | Safe display name. Not necessarily legal name. |
| `auth_provider` | enum | Example values: `email_password`, `google`, `magic_link`. |
| `is_active` | bool | False for suspended or deactivated accounts. |
| `created_at` | datetime UTC | Creation timestamp. |
| `updated_at` | datetime UTC | Last update timestamp. |

Relationships:

- One User may have one StudentProfile if role is `student`.
- One User may be linked to one or more StudentProfiles through ParentGuardianLink if role is `parent_guardian`.
- One User may appear in many AuditLog entries.
- System service users are backend-only identities and must not have UI login access.

### 2. StudentProfile

Learner-specific data extending the User entity.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Student profile identifier. |
| `user_id` | UUID foreign key to User | One-to-one relationship. |
| `first_language` | string | Learner's first language. Used for educational adaptation context only. |
| `placement_band` | int 1-4 or null | AIM-assigned placement band. Null before placement completion. |
| `enrollment_date` | date | Enrollment date. |
| `pilot_cohort_id` | string or null | Completed pilot or future cohort identifier. Null for non-cohort accounts. |
| `is_placement_complete` | bool | Whether initial placement is complete. |
| `last_active_at` | datetime UTC | Last session activity timestamp. |

Rules:

- StudentProfile is learner-owned data.
- Flutter Mobile may display learner-safe summaries only.
- Clients must not update placement band, skill state, or AIM state directly.

### 3. ParentGuardianLink

Conditional entity. Links parent/guardian users to learner profiles with a visibility scope.

Parent access must not be implemented until consent, linking, and visibility rules are approved.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Link identifier. |
| `parent_user_id` | UUID foreign key to User | Must have role `parent_guardian`. |
| `student_profile_id` | UUID foreign key to StudentProfile | Linked learner. |
| `visibility_scope` | enum | Example values: `progress_summary`, `lesson_completion`, `full_learner_safe`. |
| `linked_at` | datetime UTC | Link creation timestamp. |
| `linked_by_user_id` | UUID foreign key to User | User who created or approved the link. |

Rules:

- Parent/guardian access is summary-only unless explicitly approved otherwise.
- Parents must not see raw attempts, raw behavior scores, raw AIM internals, or diagnostic-like labels.

### 4. Skill

A unit of English learning from the skill tree. Canonical reference for AIM Engine and content.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Matches skill ID in `docs/learning/english-skill-tree.md`. |
| `name` | string | Example: `Present Perfect`. |
| `category` | enum | Example values: `PHO`, `VOC`, `GRA`, `READ`, `WRITE`, `LIS`, `SPE`. |
| `level` | int 1-4 | Difficulty level within category. |
| `parent_skill_id` | UUID foreign key to Skill or null | Hierarchical parent skill. |
| `description` | text | Human-readable description. |
| `is_active` | bool | Inactive skills are hidden from new assignments. |

Relationships:

- Skills may have prerequisite Skills through SkillPrerequisite.
- Skills appear in Questions, LessonBlocks, StudentSkillStates, ReviewSchedules, and AIMRecommendations.

#### 4a. SkillPrerequisite

Join entity for prerequisite relationships.

| Field | Type | Notes |
|---|---|---|
| `skill_id` | UUID foreign key to Skill | Skill that has a prerequisite. |
| `prerequisite_skill_id` | UUID foreign key to Skill | Required or recommended prerequisite. |
| `prerequisite_type` | enum | One of `required`, `recommended`. |
| `relationship_coefficient` | float 0.0-1.0 | Transfer strength between skills. Backend/AIM use only. |

### 5. Lesson

A structured content unit targeting one or more skills.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Lesson identifier. |
| `title` | string | Lesson title. |
| `skill_id` | UUID foreign key to Skill | Primary target skill. |
| `lesson_type` | enum | One of `intro`, `skill_practice`, `review`, `remediation`. |
| `difficulty_level` | int 1-4 | Intended content difficulty. |
| `estimated_duration_minutes` | int | Expected completion time. |
| `prerequisite_band` | int 1-4 | Minimum placement band for assignment. |
| `is_published` | bool | Only published lessons are served to learners. |
| `version` | int | Incremented on content edits. |
| `created_by_user_id` | UUID foreign key to User | Content author. |
| `published_at` | datetime UTC or null | Publish timestamp. |
| `created_at` | datetime UTC | Creation timestamp. |
| `updated_at` | datetime UTC | Last update timestamp. |

### 6. LessonBlock

An individual content or practice block within a Lesson.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Block identifier. |
| `lesson_id` | UUID foreign key to Lesson | Parent lesson. |
| `block_order` | int | 1-indexed order within lesson. |
| `block_type` | enum | Example values: `explanation`, `example`, `guided_practice`, `independent_practice`, `ai_teacher_hook`. |
| `skill_id` | UUID foreign key to Skill | Skill targeted by this block. |
| `content_payload` | JSON | Structured content defined by content standards. |
| `ai_teacher_hook_type` | enum or null | Null unless the block invokes AI Teacher support. |

### 7. Question

A practice question in the question bank.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Question identifier. |
| `skill_id` | UUID foreign key to Skill | Primary skill assessed. |
| `concept_id` | UUID or null | Optional sub-concept tag. |
| `question_type` | enum | Example values: `multiple_choice`, `fill_blank`, `true_false`, `reorder`, `match`. |
| `difficulty_level` | int 1-4 | Content-defined difficulty. |
| `question_text` | text | Question prompt. |
| `correct_answer` | text | Canonical correct answer. |
| `explanation_text` | text | Safe explanation for feedback or hints. |
| `common_error_tag` | string or null | Predefined error category. |
| `version` | int | Incremented on edit. |
| `is_published` | bool | Only published questions are served to learners. |
| `created_by_user_id` | UUID foreign key to User | Author. |
| `created_at` | datetime UTC | Creation timestamp. |
| `updated_at` | datetime UTC | Last update timestamp. |

### 8. QuestionChoice

A selectable answer choice for multiple-choice, matching, or reorder questions.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Choice identifier. |
| `question_id` | UUID foreign key to Question | Parent question. |
| `choice_text` | text | Display text. |
| `is_correct` | bool | Whether this choice is correct. |
| `display_order` | int | Canonical display order; client may receive randomized order from backend if approved. |

### 9. PlacementTestResult

Outcome record for a learner's placement test.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Placement result identifier. |
| `student_id` | UUID foreign key to StudentProfile | Learner. |
| `entry_band` | int 1-4 | Backend/AIM-assigned entry band. |
| `placement_score_pct` | float | Overall placement score. |
| `screening_score_pct` | float | Screening section score. |
| `extension_score_pct` | float or null | Null if extension section was not served. |
| `total_time_seconds` | int | Total test time. Behavior context only. |
| `completed_at` | datetime UTC | Completion timestamp. |
| `processed_by_aim_at` | datetime UTC or null | When AIM Engine processed the result. |
| `is_admin_triggered` | bool | True if placement was reset or triggered by admin override. |

Rules:

- Placement is backend/AIM-owned.
- Clients must not assign entry band locally.
- Time may be stored as behavior context but must not directly determine student level.

### 10. LearningSession

A single session a learner starts for a lesson.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Session identifier. |
| `student_id` | UUID foreign key to StudentProfile | Learner. |
| `lesson_id` | UUID foreign key to Lesson | Lesson. |
| `session_type` | enum | One of `intro`, `skill_practice`, `review`, `remediation`, `placement`. |
| `started_at` | datetime UTC | Session start. |
| `completed_at` | datetime UTC or null | Null while in progress. |
| `completion_status` | enum | One of `in_progress`, `completed`, `abandoned`, `partial`. |
| `total_time_seconds` | int or null | Set at session end. Behavior context only. |
| `active_time_seconds` | int or null | Estimated active engagement time. |
| `blocks_completed` | int | Lesson blocks reached. |
| `total_questions_served` | int | Questions served. |
| `total_questions_answered` | int | Questions answered. |
| `total_questions_skipped` | int | Questions skipped. |
| `early_exit_flag` | bool | Behavior evidence only. |
| `remediation_triggered` | bool | Whether remediation was served. |
| `ai_teacher_invocations` | int | Number of AI Teacher calls. |
| `assigned_difficulty_band` | int 1-4 | Backend-assigned difficulty band. |
| `time_of_day_bucket` | enum | Behavior context only. |
| `prerequisite_skills_met` | bool | Whether prerequisites were met at start. |
| `aim_processed_at` | datetime UTC or null | When AIM Engine processed session result. |

### 11. QuestionAttempt

One attempt by a learner on one question within a session. Multiple records may exist for retries.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Attempt identifier. |
| `session_id` | UUID foreign key to LearningSession | Parent session. |
| `student_id` | UUID foreign key to StudentProfile | Learner. |
| `question_id` | UUID foreign key to Question | Question attempted. |
| `question_version_id` | UUID | Version at time of presentation. |
| `skill_id` | UUID foreign key to Skill | Skill assessed. |
| `session_position` | int | 1-indexed question order. |
| `attempt_number` | int | 1-indexed attempt count. |
| `submitted_answer` | text or null | Null if skipped. |
| `is_correct` | bool or null | Null if skipped. |
| `response_time_seconds` | int | Educational behavior evidence only. |
| `hint_used` | bool | Whether a hint was used. |
| `skip_flag` | bool | Whether question was skipped. |
| `answer_changed_flag` | bool | Whether answer changed before submission. |
| `retry_flag` | bool | Whether this is a retry. |
| `ai_teacher_invoked_before_attempt` | bool | Whether AI Teacher help came before the attempt. |
| `recorded_at` | datetime UTC | Attempt timestamp. |

Rules:

- `response_time_seconds` must not directly affect mastery, student level, or direct difficulty increase.
- The client may submit attempt evidence; backend validates, persists, and passes approved evidence to AIM Engine.
- The client must not complete AIM calculations locally.

### 12. SessionBehavioralSignal

Derived educational behavior signals computed at session end. One record per completed or partial session.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Signal identifier. |
| `session_id` | UUID foreign key to LearningSession unique | One per session. |
| `student_id` | UUID foreign key to StudentProfile | Learner. |
| `hesitation_index` | float 0.0-1.0 | Educational behavior evidence only. |
| `sudden_slowdown_flag` | bool | Educational behavior evidence only. |
| `rushing_flag` | bool | Educational behavior evidence only. |
| `repeated_errors_flag` | bool | Educational behavior evidence only. |
| `frustration_score_contribution` | float 0.0-1.0 | Educational behavior contribution only. |
| `session_avg_response_time_seconds` | float | Behavior context only, not a mastery metric. |
| `computed_at` | datetime UTC | Computation timestamp. |

Rules:

- These signals are not clinical, medical, psychological, or diagnostic data.
- Students and parents must not see raw values.
- Admin/internal views may use operational labels only.

### 13. AITeacherInvocation

One AI Teacher call within a session.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Invocation identifier. |
| `session_id` | UUID foreign key to LearningSession | Parent session. |
| `student_id` | UUID foreign key to StudentProfile | Learner. |
| `skill_id` | UUID foreign key to Skill | Skill context. |
| `question_id` | UUID foreign key to Question or null | Question context if applicable. |
| `hook_type` | enum | Type of help requested. |
| `invocation_position_in_session` | int | Count of AI Teacher calls in the session. |
| `attempt_result_after` | bool or null | Follow-up result if applicable. |
| `response_time_after_seconds` | int or null | Follow-up response time if applicable; behavior evidence only. |
| `invoked_at` | datetime UTC | Invocation timestamp. |

Rules:

- AI Teacher Gateway is backend-only.
- AI provider keys and privileged credentials are never stored in clients.
- Raw provider prompts and privileged context are not exposed to clients.

### 14. StudentSkillState

AIM Engine per-student, per-skill adaptive state. Updated after placement and learning sessions.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Skill state identifier. |
| `student_id` | UUID foreign key to StudentProfile | Learner. |
| `skill_id` | UUID foreign key to Skill | Skill. |
| `mastery` | float 0.0-1.0 | Computed by backend-owned AIM Engine no-speed mastery rules. |
| `confidence` | float 0.0-1.0 | AIM Engine inferred confidence. |
| `attempts` | int | Total attempts for this skill. |
| `avg_speed` | float | Legacy-friendly field name for average response time context. Behavior evidence only; not mastery, level, or direct difficulty signal. |
| `retention` | float 0.0-1.0 | AIM Engine retention estimate. |
| `weakness_score` | float 0.0-1.0 | AIM Engine weakness signal. |
| `frustration_score` | float 0.0-1.0 | Educational behavior state maintained by AIM Engine. Not clinical. |
| `learning_style` | string or null | Adaptation style hint. Must not be shown as fixed identity or diagnosis. |
| `forgetting_lambda` | float | Personalized forgetting-rate parameter. Internal. |
| `last_reviewed_at` | datetime UTC or null | Last review timestamp. |
| `prerequisite_gap_flag` | bool | True if prerequisite gap exists. |
| `created_at` | datetime UTC | Creation timestamp. |
| `updated_at` | datetime UTC | Last update timestamp. |

Constraints:

- One record per `student_id` and `skill_id`.
- AIM Engine owns authoritative updates.
- Clients must not write this entity directly.
- Student-facing reports must use learner-safe summaries only.

### 15. AIMRecommendation

A next-action recommendation produced by the AIM Engine for a learner.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Recommendation identifier. |
| `student_id` | UUID foreign key to StudentProfile | Learner. |
| `recommended_lesson_id` | UUID foreign key to Lesson or null | Null if no eligible lesson exists. |
| `lesson_type` | enum | Example values: `intro`, `skill_practice`, `review`, `remediation`. |
| `primary_skill_ids` | UUID array | Skills targeted by recommendation. |
| `recommendation_reason` | enum | Example values: `new_skill`, `skill_practice`, `weakness_remediation`, `retention_review`, `placement_entry`, `content_gap`, `frustration_easy_win`. |
| `action_type` | enum | Example values: `REVIEW`, `CHALLENGE`, `EASY_WIN`, `RETEACH_CONCEPT`, `CONFIDENCE_BUILDER`, `FILL_PREREQUISITE_GAP`, `WARM_UP`. |
| `confidence_score` | float 0.0-1.0 | AIM Engine confidence in recommendation. Internal/admin only. |
| `learner_message` | text or null | Learner-safe recommendation message. |
| `generated_at` | datetime UTC | Generation timestamp. |
| `was_followed` | bool or null | Set when learner starts recommended lesson. |
| `followed_at` | datetime UTC or null | Follow timestamp. |
| `mastery_before` | float or null | Backend mastery at time of recommendation for outcome tracking. |
| `mastery_after` | float or null | Backend mastery after follow-up evidence. |
| `outcome_tracked_at` | datetime UTC or null | Outcome tracking timestamp. |

Rules:

- Clients must not generate recommendations locally.
- `learner_message` must be educational, non-clinical, non-medical, and non-diagnostic.
- `confidence_score` is not a learner-facing field.

### 16. RemediationTrigger

An event emitted by AIM Engine when remediation is needed.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Trigger identifier. |
| `student_id` | UUID foreign key to StudentProfile | Learner. |
| `skill_id` | UUID foreign key to Skill | Target skill. |
| `weakness_score_at_trigger` | float | Internal weakness score at trigger time. |
| `recommended_remediation_lesson_id` | UUID foreign key to Lesson or null | Recommended remediation lesson. |
| `triggered_at` | datetime UTC | Trigger timestamp. |
| `resolved_at` | datetime UTC or null | Resolution timestamp. |

Rules:

- Learners should see safe support wording, not raw trigger scores.
- Triggering remediation must not create a dead-end learning path.

### 17. ReviewSchedule

A review need generated by AIM Engine retention logic.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Schedule identifier. |
| `student_id` | UUID foreign key to StudentProfile | Learner. |
| `skill_id` | UUID foreign key to Skill | Skill due for review. |
| `scheduled_review_date` | date | Date when review is scheduled. |
| `current_retention_estimate` | float | Internal/backend retention estimate. |
| `is_due` | bool | Whether review is due. |
| `is_completed` | bool | Set true when learner completes review. |
| `last_calculated_at` | datetime UTC | Last calculation timestamp. |

Rules:

- Retention scheduling is backend/AIM-owned.
- Flutter Mobile may display due review cards only from backend-approved data.

### 18. MicroGoal

A daily, weekly, or monthly micro-goal generated for a learner.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Goal identifier. |
| `student_id` | UUID foreign key to StudentProfile | Learner. |
| `skill_id` | UUID foreign key to Skill | Skill target. |
| `goal_type` | enum | One of `daily`, `weekly`, `monthly`. |
| `goal_text` | text | Learner-safe goal text. |
| `target_metric` | float or null | Numeric target if applicable. |
| `is_achieved` | bool | Achievement status. |
| `generated_at` | datetime UTC | Generation timestamp. |
| `target_date` | date | Due date. |
| `achieved_at` | datetime UTC or null | Achievement timestamp. |

Rules:

- Goals must be motivational, not shame-based.
- Goals must not use manipulative engagement patterns.

### 19. ContentQualityFlag

A flag raised against a question or session for content review or data quality investigation.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Flag identifier. |
| `flag_type` | enum | Example values: `question_quality`, `session_quality`, `fairness_audit`. |
| `entity_type` | enum | One of `question`, `session`. |
| `entity_id` | UUID | ID of the flagged entity. |
| `raised_at` | datetime UTC | Flag timestamp. |
| `raised_by` | enum | One of `system_auto`, `human_reviewer`, `pilot_admin`. |
| `resolved_at` | datetime UTC or null | Resolution timestamp. |
| `resolution_note` | text or null | Resolution note. |
| `resolved_by_user_id` | UUID foreign key to User or null | Resolver. |

### 20. AuditLog

Append-only audit trail for significant backend events.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Audit record identifier. |
| `actor_user_id` | UUID foreign key to User or null | Null for automated system events. |
| `actor_role` | enum | Actor role at the time of event. |
| `action` | enum/string | Stable action name, such as `student.session.completed` or `admin.aim_override.applied`. |
| `entity_type` | string | Affected entity type. |
| `entity_id` | UUID | Affected entity ID. |
| `before_state` | JSON or null | Snapshot before action when relevant. |
| `after_state` | JSON or null | Snapshot after action when relevant. |
| `metadata` | JSON or null | Extra context. Not used as authoritative logic. |
| `occurred_at` | datetime UTC | Event timestamp. |
| `ip_address_hash` | string or null | Hashed IP for security audit. Raw IP is not stored. |

Rules:

- AuditLog records are append-only.
- No secrets, provider keys, tokens, raw emails, or unnecessary personal data should appear in audit payloads.
- Audit views are role-scoped.

### 21. AdminOverride

A recorded admin override of AIM Engine state or recommendation.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Override identifier. |
| `admin_user_id` | UUID foreign key to User | Must have approved admin/project role. |
| `student_id` | UUID foreign key to StudentProfile | Target learner. |
| `action` | enum | Example values: `reset_placement`, `reset_skill_state`, `force_lesson`, `skip_lesson`. |
| `target_skill_id` | UUID foreign key to Skill or null | Required for skill reset. |
| `target_lesson_id` | UUID foreign key to Lesson or null | Required for lesson override actions. |
| `reason` | text or null | Optional justification. |
| `applied_at` | datetime UTC | Applied timestamp. |
| `audit_log_id` | UUID foreign key to AuditLog | Linked audit event. |

Rules:

- Overrides must be backend-authorized.
- Overrides must be audit-logged.
- Overrides must not expose client-side AIM authority.

### 22. ProgressReport

A generated learner progress summary snapshot.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID primary key | Report identifier. |
| `student_id` | UUID foreign key to StudentProfile | Report subject. |
| `report_type` | enum | One of `student_self`, `parent_summary`, `admin_cohort`, `pilot_export`. |
| `generated_for_user_id` | UUID foreign key to User | User who requested or receives the report. |
| `period_start` | date | Report start date. |
| `period_end` | date | Report end date. |
| `lessons_completed` | int | Completed lesson count. |
| `total_study_time_seconds` | int | Study time summary. |
| `skills_mastered` | int | Backend-approved count. |
| `top_weaknesses` | UUID array | Skill IDs only; learner-safe wording required in UI. |
| `top_strengths` | UUID array | Skill IDs only. |
| `current_streak_days` | int | Streak count if approved. |
| `recommendation_summary` | JSON | Latest AIM recommendation in learner-safe language. |
| `generated_at` | datetime UTC | Generation timestamp. |
| `report_format` | enum | Example values: `api_json`, `pdf_export`. |

Rules:

- Student/parent reports must not expose raw AIM internals.
- Parent summary is conditional until parent access is approved.
- Admin exports should minimize identifiers and use anonymization where possible.

## Entity Relationship Summary

```text
User
 ├── StudentProfile (1:1)
 │    ├── ParentGuardianLink (M:M via parent User)
 │    ├── PlacementTestResult (1:N)
 │    ├── LearningSession (1:N)
 │    │    ├── QuestionAttempt (1:N)
 │    │    ├── SessionBehavioralSignal (1:1)
 │    │    └── AITeacherInvocation (1:N)
 │    ├── StudentSkillState (1:N, one per Skill)
 │    ├── AIMRecommendation (1:N)
 │    ├── RemediationTrigger (1:N)
 │    ├── ReviewSchedule (1:N)
 │    ├── MicroGoal (1:N)
 │    └── ProgressReport (1:N)
 └── AuditLog (actor)

Skill
 ├── SkillPrerequisite (M:M self-join)
 ├── Lesson (1:N)
 │    └── LessonBlock (1:N)
 ├── Question (1:N)
 │    └── QuestionChoice (1:N)
 └── StudentSkillState (N:1)

AdminOverride → AuditLog (1:1 link)
ContentQualityFlag → Question or LearningSession
```

## Data Access by Role

Per `docs/product/roles-and-permissions.md`, access to entity data is scoped as follows.

| Entity | Student | Parent/Guardian | Pilot Admin | Content Manager | Human Reviewer | Project Owner |
|---|---|---|---|---|---|---|
| User | Own record | Own record | Support access | Own record | Own record | Full |
| StudentProfile | Own only | Linked learner summary only | Cohort access | No | Scoped samples | Full |
| ParentGuardianLink | No | Own links | Manage approved links | No | No | Full |
| LearningSession | Own learner-safe summary | Linked learner summary | Full cohort | No | Scoped samples | Full |
| QuestionAttempt | Own learner-safe result | No | Full cohort | No | Scoped samples | Full |
| SessionBehavioralSignal | No raw access | No raw access | Operational label/detail | No | Scoped samples | Full |
| StudentSkillState | Own learner-safe summary | Linked learner summary | Full cohort | No | Scoped samples | Full |
| AIMRecommendation | Own learner-safe message | Summary only if approved | Full cohort | No | Scoped samples | Full |
| AuditLog | No | No | Scoped | No | Scoped samples | Full |
| Question / Lesson | Read published | Summary only if approved | Read all | Manage | Review | Full |
| ContentQualityFlag | No | No | View | Manage | Manage | Full |
| ProgressReport | Own | Linked learner summary if approved | Full cohort | No | Review exports | Full |

## Non-Goals

This document does not:

- Create SQL DDL, ORM models, or migrations.
- Create a Student Web App.
- Implement Flutter Mobile data models.
- Implement React Web data models.
- Implement NestJS API models.
- Define final indexing, partitioning, or query optimization strategy.
- Define final deletion/anonymization workflow.
- Move AIM Engine logic into any client.
- Allow clients to calculate mastery, student level, weakness, difficulty, retention, or recommendations locally.

## Assumptions

- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless a later documented decision changes this.
- Primary key type is UUID for all entities to avoid exposed sequential identifiers.
- `StudentSkillState` maps to the planning-level AIM Engine state concept.
- `AuditLog` is append-only.
- `ProgressReport` is generated by backend and cached as a snapshot.
- Parent access remains conditional.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.

## Open Questions

| Question | Current Handling |
|---|---|
| Should `QuestionAttempt` store full rendered question at attempt time or only `question_version_id`? | Store `question_version_id` by default. Full reconstruction belongs to content versioning. |
| Should `AIMRecommendation` store a full student state snapshot? | Store lightweight before/after evidence by default. Full audit can use AuditLog where approved. |
| Should `MicroGoal` be generated on session end or scheduled daily? | Session-end generation is simpler for early Phase 1; scheduled generation can be added later. |
| Should `ProgressReport` be generated on demand or scheduled? | On demand with caching for early Phase 1; scheduled summary remains optional. |
| Does `ParentGuardianLink` require admin approval or self-linking? | Default to admin-approved linking until privacy rules are finalized. |
| Should `avg_speed` be renamed to `avg_response_time_seconds` before implementation? | Recommended for implementation clarity. If kept, document it as behavior evidence only. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/roles-and-permissions.md`
- `docs/data/session-data-capture.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/learning/english-skill-tree.md`
- `docs/security/ai-safety-privacy-rules.md`
- `docs/api/api-planning-baseline.md`
- `docs/analytics/reports-scope.md`

## Acceptance Notes

- Dependencies checked: P0-001, P0-003, P0-014, P0-015, P0-017, P0-021, and P0-022.
- This document defines 22 entities covering identity, learner profiles, content, attempts, behavior evidence, AIM states, recommendations, audit, admin overrides, and reports.
- Relationships, role access, assumptions, non-goals, open questions, and related documents are included.
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
- No runtime source code, Student Web App, Flutter AIM logic, SQL migration, ORM model, or backend implementation was added.
