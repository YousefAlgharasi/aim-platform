# AIM AI Safety, Privacy, and Data Rules

## Purpose

This document defines the non-negotiable safety rules, privacy principles, data minimization requirements, AI Teacher constraints, and educational-only behavioral analysis boundaries for the AIM platform. It is the authoritative compliance reference for all Phase 1 engineering, content, and AI decisions. Every component of the platform — backend, AIM Engine, AI Teacher gateway, admin dashboard, and mobile app — must be consistent with this document.

## Scope

Phase 0 planning documentation only. No backend code, security implementation, database migrations, privacy middleware, Flutter code, or AI prompt engineering is produced here. This document establishes the rules that implementation must follow.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-003 | `docs/product/roles-and-permissions.md` | Present. Role model and access boundaries this document enforces. |
| P0-013 | `docs/ai-teacher/behavior-rules.md` | Present. AI Teacher interaction rules this document extends with safety and privacy specifics. |
| P0-015 | `docs/data/session-data-capture.md` | Present. Session data fields this document governs for minimization and safe use. |

---

## Section 1 — AI Safety Rules

### 1.1 Educational-Only Scope

AIM is an English learning platform. All AI behavior analysis and AI Teacher interactions must remain strictly within the scope of educational adaptation.

| Rule | Detail |
|---|---|
| **No clinical analysis** | AIM must never produce, imply, or log statements that resemble psychological, cognitive, neurological, or medical assessment. Conditions such as dyslexia, ADHD, processing disorders, anxiety, or depression must never be mentioned, inferred, or flagged in any output visible to users, admins, or parents. |
| **No personality profiling** | AIM behavioral signals (frustration_score, hesitation_index, learning_style) describe learning behavior patterns only. They must never be interpreted as personality traits, character assessments, or stable personal attributes. |
| **No predictive life outcomes** | AIM must not make or imply predictions about a student's future academic, professional, or personal outcomes based on learning performance data. |
| **Educational language only** | All user-facing language — in the AI Teacher, recommendations, progress reports, and parent summaries — must use educational terminology. Any output that could be misread as clinical must be blocked or reworded before delivery. |

### 1.2 AI Teacher Safety Hard Boundaries

These constraints apply to every AI Teacher response, regardless of student input. They are enforced at the backend response validation layer before any output reaches the Flutter client.

| Boundary | Rule | Enforcement Point |
|---|---|---|
| No clinical assessment language | Responses must not contain any phrasing suggesting a learning disorder, mental health condition, or cognitive limitation. | Backend response validator — prohibited phrases list |
| No unsolicited personal questions | AI Teacher must not ask about the student's home life, family, emotions, health, or personal circumstances. | Prompt engineering constraint + validator |
| No content outside the current lesson skill | AI Teacher is scoped to the current `skill_id` and lesson block only. Responses referencing other topics must be discarded. | Backend off-topic detection |
| No direct answer leakage in guided retry | In Mode 4 (Retry With Help), the correct answer must not appear verbatim in the response. | Backend answer-leakage check |
| No excessive praise | Praise calibration rules from `docs/ai-teacher/behavior-rules.md` apply. Emotional manipulation through over-praise is prohibited. | Prompt instruction + human review |
| No engagement maximization | The AI Teacher must not be prompted or optimized to maximize time-on-platform, session length, or return frequency at the expense of the student's educational progress or wellbeing. | Prompt engineering policy — no retention-optimization objective |
| Off-topic input handling | If a student sends off-topic, abusive, or distressing input, the AI Teacher deflects to the lesson without engaging with the content. After two instances, the session is flagged for admin review. | Prompt instruction + session flag |

### 1.3 AIM Engine Safety Rules

| Rule | Detail |
|---|---|
| **Response time is behavioral evidence only** | `response_time_seconds` must never directly increase difficulty, reduce mastery, penalize a learner, or be shown to students as a performance metric. It may inform hesitation and slowdown signals only, as defined in `docs/data/session-data-capture.md`. |
| **Frustration triggers support, not punishment** | When `frustration_score > 0.7`, the AIM Engine must reduce difficulty and serve a supportive recommendation. It must never increase difficulty, withhold content, or penalize the student for showing frustration signals. |
| **Low-reliability data must not produce strong judgments** | When attempt count is low (< 5 for a skill), mastery estimates have high uncertainty. The AIM Engine must treat low-reliability states conservatively — prefer collecting more evidence over making strong adaptive decisions. |
| **Prerequisite gaps are review queues, not blockers** | A detected prerequisite gap adds to the review queue and future recommendation. It must never block a student from progressing in a way that creates a dead-end experience. |
| **No speed-as-mastery** | Response time and speed signals must not enter mastery calculation, student level, or direct difficulty-increase logic. Speed is behavioral evidence only. |
| **Admin overrides are audit-logged** | Every admin override of AIM Engine state is recorded in `AuditLog` with the admin's user ID, the action, and a reason field. Override logs are never deleted. |

---

## Section 2 — Privacy Rules

### 2.1 Data Minimization Principles

| Principle | Application |
|---|---|
| **Collect only what is needed** | Each data field captured during a session must have a defined purpose (AIM Engine input, analytics, content quality, audit). Fields without a defined purpose must not be collected. |
| **No raw personal identifiers in analytics** | Analytics reports and AIM outcome tracking must use `student_id` (UUID) only. Display names, email addresses, and other personal identifiers must not appear in analytics datasets or exports. |
| **No biometric or device sensor data** | AIM must not collect or infer data from device sensors, camera, microphone, accelerometer, or biometric sources. Only text-based interaction data is collected. |
| **No third-party tracking** | The platform must not embed third-party tracking pixels, advertising SDKs, or behavioral analytics tools from external providers. |
| **No data sale or external profiling** | Student learning data must never be sold, licensed, or shared with third parties for profiling, advertising, or non-educational purposes. |

### 2.2 Data Collected and Justification

Every field captured during a session is justified below. Any field not listed here must not be collected.

| Field | Collected | Justification | Used By |
|---|---|---|---|
| `student_id` | Yes | Required to associate all data with the correct learner | All systems |
| `session_id` | Yes | Required to link attempts, signals, and AIM results to a session | Backend, AIM Engine |
| `lesson_id`, `question_id`, `skill_id` | Yes | Required for mastery calculation and content quality analysis | AIM Engine, Content review |
| `is_correct` | Yes | Core input to accuracy component of mastery formula | AIM Engine |
| `attempt_number`, `retry_flag` | Yes | Required for retry rate metric | AIM Engine |
| `response_time_seconds` | Yes | Behavioral evidence for hesitation and slowdown signals only. Not a mastery metric. | AIM Engine (behavioral signals) |
| `hint_used` | Yes | Input to mastery formula (hint-assisted correct carries reduced weight) | AIM Engine |
| `skip_flag` | Yes | Weak evidence of skill gap; contributes to weakness detection | AIM Engine |
| `answer_changed_flag` | Yes | Behavioral signal for self-doubt; contributes to confidence inference | AIM Engine |
| `ai_teacher_invoked_before_attempt` | Yes | Tracks hint-dependency pattern; affects mastery weight | AIM Engine |
| `session_position` | Yes | Needed for early-session vs. late-session error pattern analysis | AIM Engine |
| `time_of_day_bucket` | Yes | Behavioral context for session quality; not used in mastery calculation | AIM Engine (behavioral context) |
| `device_class` | Optional | Session diagnostic only; never used in adaptive logic | Admin diagnostics |
| `common_error_tag` | Yes | Error pattern classification input | AIM Engine |
| `question_version_id` | Yes | Required for content quality audit when questions are edited | Content review |

### 2.3 Data NOT Collected

The following data must never be collected by the AIM platform:

| Data Type | Reason Not Collected |
|---|---|
| Student's real name | Display name is sufficient. Real name creates unnecessary identity risk. |
| Student's precise age | Year of birth may be collected for COPPA/minor protection purposes only, not stored in session data. |
| Student's location (GPS or IP geolocation) | Not needed for educational adaptation. |
| Student's device identifiers (IMEI, advertising ID) | Not needed; invasive. |
| Biometric data (face, voice, keystroke dynamics) | Not within AIM's educational scope. |
| Social media profiles or external account data | Not needed; privacy risk. |
| Parent/guardian personal data beyond email | Only email for account linking; no further personal data. |
| Raw LLM conversation logs visible to students/parents | AI Teacher exchanges are backend audit records only. |

### 2.4 AI Provider Data Rules

| Rule | Detail |
|---|---|
| **Keys stay in backend** | AI provider API keys (OpenAI, Anthropic, or other) must never be stored in, passed to, or accessible from the Flutter client, admin dashboard client, or any frontend environment. Keys live only in the backend server environment. |
| **Minimum context to AI providers** | The AI Teacher context payload (defined in `docs/ai-teacher/behavior-rules.md`) contains only what is required for the response. Student names, email addresses, full profiles, and personal identifiers are never sent to AI providers. |
| **No training on student data without consent** | Student learning data must not be submitted to AI provider model training pipelines. Where provider agreements allow opt-out of training data use, the platform must opt out by default. |
| **Provider agreement review** | Before the pilot launches, the team must confirm the selected AI provider's data processing agreement is compatible with minor learner data protection requirements (COPPA, GDPR-K, or applicable local law). |
| **Response logging** | All AI Teacher responses are logged to the backend audit system for human review. These logs are internal only and are not accessible to students or parents. |

---

## Section 3 — Behavioral Analysis Rules

### 3.1 Educational-Only Boundary

AIM captures behavioral signals from learning sessions to improve educational adaptation. These signals must be used only for educational purposes and must never be reframed as psychological or clinical assessments.

| Signal | Allowed Educational Use | Prohibited Use |
|---|---|---|
| `frustration_score` | Trigger easier content, supportive tone, or a break recommendation | Clinical anxiety or stress diagnosis; parent notification as a wellbeing alert |
| `hesitation_index` | Inform AIM Engine's mastery uncertainty; detect guessing patterns | Framed as a measure of intelligence, processing speed, or cognitive ability |
| `sudden_slowdown_flag` | Detect potential fatigue or distraction within the session | Diagnose ADHD, attention disorders, or behavioral conditions |
| `repeated_errors_flag` | Trigger guided retry or remediation recommendation | Diagnose learning disability, dyslexia, or processing disorder |
| `learning_style` | Adapt AI Teacher examples and explanation style | Permanent categorization of the learner as a fixed type |
| `avg_speed` | Stored as behavioral context only. Must not be used as a mastery formula component, level signal, or direct difficulty-increase signal. | Direct measure of intelligence or aptitude |
| `answer_changed_flag` | Contribute to confidence inference | Framed as deceptive behavior or cheating indicator |

### 3.2 Behavioral Signal Labelling Rules

All behavioral signal values are internal to the AIM Engine and backend. They must be translated before reaching any user.

| Signal | Never Shown To | Allowed Translation for Users |
|---|---|---|
| `frustration_score` float | Students, parents, human reviewers (raw) | Admin sees operational label: "High frustration signal." Student sees recommendation message only. |
| `hesitation_index` float | Students, parents | Not surfaced to users. Informs AIM Engine internally. |
| `learning_style` enum | Students as a label | Can inform AI Teacher adaptation silently. Must not be presented as a fixed diagnosis. |
| `weakness_score` float | Students | Surfaced as recommendation: "Let's review [skill]." Never as a score. |
| `frustration_score_contribution` | Students, parents | Not surfaced. Internal session signal only. |

### 3.3 Consent and Transparency

| Requirement | Rule |
|---|---|
| **Informed use** | The platform's onboarding or terms of use must inform students and parents (where applicable) that behavioral learning signals are collected to personalize their experience. The explanation must use plain language. |
| **No hidden profiling** | The platform must not build behavioral profiles beyond what is described in the onboarding/terms of use. |
| **Right to explanation** | If a student or parent asks why they received a particular recommendation, the platform must be able to provide a learner-safe explanation. Raw AIM scores must not be shared in that explanation. |
| **Pilot-specific consent** | For the first two-week pilot, participants must explicitly agree to pilot data collection terms before starting. This is a pilot-specific requirement independent of standard product terms. |

---

## Section 4 — Data Access and Storage Rules

### 4.1 Access Control

All data access is governed by `docs/product/roles-and-permissions.md`. The following rules are security-specific additions:

| Rule | Detail |
|---|---|
| **Backend authorization is final** | No role, permission, or data access decision is made by the Flutter client or admin dashboard client. The backend validates every request. |
| **Cross-student access is always blocked** | Students can never access another student's data via any API endpoint. This must be enforced at the query layer, not just the route layer. |
| **Admin access is audit-logged** | Every admin access to learner data is recorded in `AuditLog`. Bulk exports are logged with the export scope and requesting user. |
| **Service accounts have no UI access** | Backend service identities have no associated admin dashboard or Flutter client login. They exist in the server environment only. |
| **Secrets are server-only** | AI provider keys, database credentials, Supabase service role keys, and any other privileged secrets must never appear in client-side code, version control, build artifacts, or logs. |

### 4.2 Data Retention

These are planning-level rules. Exact retention periods and deletion workflows are implementation concerns for Phase 1.

| Data Category | Retention Rule |
|---|---|
| Student learning data (sessions, attempts, skill states) | Retained for the lifetime of the student's account. Deleted upon account deletion request. |
| AuditLog records | Retained indefinitely (append-only, never deleted). If a student account is deleted, audit entries are anonymised (student_id replaced with a tombstone marker). |
| AI Teacher exchange logs | Retained for pilot duration plus 90 days for quality review. Reviewed and purged or archived thereafter. |
| Admin override records | Retained for the lifetime of the associated student account. |
| Pilot export data | Retained for pilot analysis period (defined by project owner). Deleted or anonymised after analysis is complete. |

### 4.3 Data at Rest and in Transit

| Requirement | Rule |
|---|---|
| **Encryption in transit** | All external API traffic uses HTTPS/TLS 1.2+. HTTP is not supported. |
| **Encryption at rest** | Database storage must use encryption at rest. Supabase PostgreSQL provides this by default. No unencrypted storage of personal or behavioral data. |
| **No sensitive data in logs** | Server logs must not contain student personal identifiers, AI provider keys, session tokens, or raw behavioral scores. Use structured logging with field masking. |
| **No sensitive data in URLs** | Student IDs and session IDs in API paths are UUIDs. No names, email addresses, or guessable identifiers in URL paths. |

---

## Section 5 — Minor Learner Protections

The AIM pilot targets students who may be minors. The following protections apply regardless of the specific age of any pilot participant.

| Protection | Rule |
|---|---|
| **No direct marketing to learners** | The platform must not show advertisements, promote paid upgrades, or send marketing communications to student accounts. |
| **No social features in MVP** | Leaderboards, peer comparisons, and social sharing features are out of scope for MVP. These features create peer-pressure dynamics inappropriate for a pilot with minors. |
| **Parental consent for minors** | If any pilot participant is under 18 (or under the applicable local minor age threshold), parental or guardian consent must be obtained before enrollment. The project owner is responsible for verifying this before the pilot starts. |
| **No engagement dark patterns** | The platform must not use countdown timers, streak-loss warnings, or shame mechanics to pressure students into sessions. Micro-goals are motivational and positive; they must not carry penalties. |
| **Safe content only** | All lesson content, AI Teacher responses, and system messages must be age-appropriate. The content review workflow (human reviewer role) must include an age-appropriateness check. |
| **Data deletion on request** | If a parent or guardian requests deletion of a minor's data, the platform must support account and data deletion within a reasonable timeframe (target: 30 days from verified request). |

---

## Section 6 — Incident and Violation Rules

### 6.1 Safety Incident Detection

| Incident Type | Detection Signal | Response |
|---|---|---|
| AI Teacher produces clinical language | Backend response validator flags prohibited phrase | Discard response, substitute fallback, log incident for immediate content team review |
| AI Teacher produces off-topic or harmful content | Off-topic detection + human review flag | Discard response, substitute fallback, escalate to project owner if harmful |
| Student sends distressing input (self-harm reference, crisis language) | Keyword detection in student input | AI Teacher does not engage with content; responds: "Let's stay focused on the lesson." Session flagged for admin immediate review. Admin must follow up within 24 hours. |
| Suspected data breach or unauthorized access | Admin audit log anomaly or security alert | Notify project owner immediately. Follow applicable breach notification requirements. |

### 6.2 Prohibited System Behaviors

The following behaviors are prohibited in any version of the AIM platform and must never be introduced through feature additions, prompt changes, or configuration updates:

| Prohibited Behavior | Reason |
|---|---|
| Optimizing AI Teacher for engagement or session length | Creates conflict with educational wellbeing goals |
| Selling or sharing learner behavioral data | Fundamental privacy violation |
| Using response time alone to gate content progression | Speed is not mastery |
| Applying clinical labels in any user-facing surface | Safety and legal risk |
| Storing AI provider keys in client-side code | Security non-negotiable |
| Blocking student progress permanently based on AIM state | AIM supports, not controls; students must always have a path forward |
| Showing one student's data to another | Privacy and trust violation |

---

## Non-Goals

- This document does not implement GDPR, COPPA, or local privacy law compliance procedures (those require legal review and are a Phase 1 implementation task).
- This document does not write security middleware, authentication code, or encryption configuration.
- This document does not create a Student Web App.
- This document does not implement Flutter privacy controls.
- This document does not define a penetration testing or vulnerability management programme (post-MVP security hardening).

---

## Assumptions

- The first pilot has five adult or near-adult Arabic-speaking A1 English learners. Parental consent requirements will be confirmed by the project owner before any minor participant is enrolled.
- Supabase Auth and Supabase PostgreSQL provide baseline identity, access, and encryption-at-rest controls. The backend enforces all additional authorization and data access rules.
- The AI provider for the AI Teacher gateway will be selected in Phase 1. The provider must be vetted against the rules in Section 2.4 before use.
- The prohibited phrases list for AI Teacher response validation is a configuration file maintained by the content team. It is not hardcoded. Its initial contents are defined during Phase 1 prompt engineering.

---

## Open Questions

| Question | Current Handling |
|---|---|
| Which specific privacy law governs the pilot (GDPR, PDPA, local Saudi data law, or other)? | Deferred to legal review before pilot launch. Project owner must confirm. |
| Should the platform support a student-initiated data export ("download my data") in MVP? | Not required for MVP pilot. Recommended for Phase 1 public launch. |
| Should the AI Teacher exchange logs be accessible to human reviewers for quality review, or only to project owners? | Current roles-and-permissions allows human reviewers scoped access. Confirm scope limit before pilot. |
| How should a crisis or distressing student input be escalated in a two-week pilot with five learners? | Recommend direct admin notification (not an automated system) for the pilot. A scalable escalation workflow is a Phase 1 safeguarding feature. |
| What is the required data deletion response time for the pilot? | Propose 30 days as a reasonable target. Legal review may require shorter window depending on applicable law. |

---

## Related Documents

- `docs/product/roles-and-permissions.md` — Role-based access rules this document enforces.
- `docs/ai-teacher/behavior-rules.md` — AI Teacher interaction rules this document extends with safety and privacy specifics.
- `docs/data/session-data-capture.md` — Data fields governed by minimization and safe-use rules in this document.
- `docs/data/initial-data-model.md` — Entity model subject to retention and access rules in this document.
- `docs/product/non-negotiables.md` — Platform-wide non-negotiables this document expands for AI and privacy.
- `docs/analytics/reports-scope.md` — Report delivery rules that reference learner-safe constraints defined here.
- `docs/aim-engine/boundary-and-io-contract.md` — AIM Engine boundary; AI key protection and behavioral signal rules apply there.

---

## Acceptance Notes

- Dependencies checked: P0-003 (`docs/product/roles-and-permissions.md` present), P0-013 (`docs/ai-teacher/behavior-rules.md` present), P0-015 (`docs/data/session-data-capture.md` present).
- This document covers six sections: AI safety rules, privacy rules, behavioral analysis rules, data access and storage, minor learner protections, and incident and violation rules.
- All rules are non-negotiable and reference the specific documents and fields they govern.
- No runtime code, security middleware, database migrations, Flutter code, or AI prompt templates were created.
- Task is ready to mark Done in Notion.
