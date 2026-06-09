# AIM AI Safety, Privacy, and Data Rules

## Purpose

This document defines the non-negotiable safety rules, privacy principles, data minimization requirements, AI Teacher constraints, credential boundaries, and educational-only behavior analysis rules for AIM.

It is the authoritative compliance reference for Phase 1 engineering, content, AI, reporting, and admin/internal workflows.

## Scope

This is Phase 0 planning documentation only.

This document does not implement:

- Backend runtime code.
- NestJS API code.
- FastAPI routes.
- Security middleware.
- Database migrations.
- Privacy middleware.
- Flutter Mobile code.
- React Web code.
- AI prompt templates.
- AIM Engine runtime code.
- AI Teacher Gateway runtime code.
- A separate Student Web App.

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

All safety, privacy, data, AI Teacher, and AIM Engine boundary rules apply to every surface:

- Flutter Mobile.
- Completed React Web pilot surfaces, if referenced historically.
- Admin/internal UI surfaces.
- Backend API.
- Python AIM Engine.
- AI Teacher Gateway.
- Future clients, if approved later.

No client may call the AIM Engine directly, call the AI Teacher Gateway directly, store AI provider keys, or calculate AIM outputs locally.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for platform-wide guardrails. |
| P0-003 | `docs/product/roles-and-permissions.md` | Present. Role model and access boundaries this document enforces. |
| P0-013 | `docs/ai-teacher/behavior-rules.md` | Present. AI Teacher behavior rules this document extends with safety and privacy requirements. |
| P0-014 | `docs/aim-engine/boundary-and-io-contract.md` | Checked for AIM Engine boundary rules. |
| P0-015 | `docs/data/session-data-capture.md` | Present. Session data fields this document governs. |
| P0-016 | `docs/data/initial-data-model.md` | Checked for stored entities and relationships. |
| P0-017 | `docs/api/api-planning-baseline.md` | Checked for backend/API boundary rules. |
| P0-021 | `docs/analytics/reports-scope.md` | Checked for reporting visibility rules. |

## Section 1 — AI Safety Rules

### 1.1 Educational-Only Scope

AIM is an English learning platform. All AI behavior analysis and AI Teacher interactions must remain strictly within educational adaptation.

| Rule | Detail |
|---|---|
| No clinical analysis | AIM must never produce, imply, or log statements that resemble psychological, cognitive, neurological, or medical assessment. |
| No personality profiling | AIM behavior signals describe learning behavior patterns only. They must never become personality traits, character assessments, or stable personal labels. |
| No predictive life outcomes | AIM must not predict a learner's future academic, professional, or personal outcomes. |
| Educational language only | User-facing language in AI Teacher responses, recommendations, progress reports, parent summaries, and notifications must use educational terminology only. |
| Safe rewording required | Any output that could be misread as clinical, medical, diagnostic, shame-based, or identity-based must be blocked or reworded before delivery. |

### 1.2 AI Teacher Safety Hard Boundaries

These constraints apply to every AI Teacher response.

| Boundary | Rule | Enforcement Point |
|---|---|---|
| No clinical assessment language | Responses must not suggest a learning disorder, mental health condition, or cognitive limitation. | Backend response validator |
| No unsolicited personal questions | AI Teacher must not ask about home life, family, health, private emotions, or personal circumstances. | Prompt constraints and validator |
| Lesson-scope only | AI Teacher is scoped to the current skill, lesson block, and question context. | Backend off-topic detection |
| No direct answer leakage in guided retry | In retry/help mode, the correct answer must not be given verbatim when guidance is intended. | Backend answer-leakage check |
| No excessive praise | Praise must be calibrated, specific, and educational. | Prompt rules and review |
| No engagement maximization | AI Teacher must not optimize for session length, time-on-platform, or return frequency at the expense of learning wellbeing. | Prompt policy |
| Off-topic input handling | AI Teacher deflects back to the lesson and does not engage in unrelated personal content. | Prompt rules and backend flagging |

### 1.3 AIM Engine Safety Rules

| Rule | Detail |
|---|---|
| Response time is behavior evidence only | `response_time_seconds`, average response time, and speed score must never directly increase mastery, reduce mastery, change student level, or directly increase difficulty. |
| No speed-as-mastery | Speed contributes no mastery component. It may only inform educational behavior signals such as hesitation, rushing, possible guessing, fatigue/distraction, or low confidence. |
| Frustration triggers support, not punishment | High frustration evidence should lead to safer support, easier review, break suggestions, or remediation. It must not punish the learner. |
| Low-reliability data must not produce strong judgments | When evidence volume is low, the AIM Engine must prefer conservative decisions and collect more evidence. |
| Prerequisite gaps are review queues, not dead ends | A prerequisite gap may add review/remediation, but it must not permanently block progress. |
| Admin overrides are audit-logged | Every admin override is recorded in `AuditLog` with actor, action, target, timestamp, and reason. |
| Backend authority only | AIM decisions are backend-owned and must not be calculated or overridden by clients. |

## Section 2 — Privacy Rules

### 2.1 Data Minimization Principles

| Principle | Application |
|---|---|
| Collect only what is needed | Every captured data field must have a defined purpose: AIM input, analytics, content quality, safety, or audit. |
| No raw personal identifiers in analytics | Analytics exports should use IDs by default and avoid display names, emails, or personal identifiers. |
| No biometric/device sensor data | AIM must not collect face, voice biometrics, keystroke dynamics, accelerometer data, camera data, or microphone data for adaptation. |
| No third-party tracking | No advertising SDKs, tracking pixels, or external behavioral profiling tools. |
| No data sale or external profiling | Learner data must never be sold, licensed, or shared for advertising/profiling. |
| Minimum provider context | AI providers receive only the minimum context needed for the current explanation. |

### 2.2 Data Collected and Justification

| Field | Collected | Justification | Used By |
|---|---|---|---|
| `student_id` | Yes | Associate data with the correct learner. | Backend, AIM Engine |
| `session_id` | Yes | Link attempts, signals, and AIM outputs to a session. | Backend, AIM Engine |
| `lesson_id`, `question_id`, `skill_id` | Yes | Required for skill-level learning evidence and content quality. | Backend, AIM Engine, Content Review |
| `is_correct` | Yes | Core learning evidence for accuracy. | AIM Engine |
| `attempt_number`, `retry_flag` | Yes | Required for retry and evidence quality analysis. | AIM Engine |
| `response_time_seconds` | Yes | Behavior evidence for hesitation/slowdown/rushing only. Not a mastery metric. | AIM Engine behavior signals |
| `hint_used` | Yes | Evidence quality and hint-dependence analysis. | AIM Engine |
| `skip_flag` | Yes | Weak evidence of difficulty, gap, or disengagement. | AIM Engine |
| `answer_changed_flag` | Yes | Behavior evidence for uncertainty/self-review. | AIM Engine |
| `ai_teacher_invoked_before_attempt` | Yes | Tracks help usage patterns. | AIM Engine |
| `session_position` | Yes | Needed for early/late session pattern analysis. | AIM Engine |
| `time_of_day_bucket` | Yes | Session quality context only. | AIM Engine behavior context |
| `device_class` | Optional | Session diagnostics only. Never used for mastery or adaptation. | Admin diagnostics |
| `common_error_tag` | Yes | Error pattern classification input. | AIM Engine, Content Review |
| `question_version_id` | Yes | Required for content quality audit after edits. | Content Review |

### 2.3 Data Not Collected

| Data Type | Reason Not Collected |
|---|---|
| Student's legal name | Display name is sufficient unless later compliance requires otherwise. |
| Precise age in session data | Minor protection can use separate consent/account policy; session data does not need exact age. |
| GPS location | Not needed for educational adaptation. |
| Device identifiers such as IMEI or advertising ID | Not needed and invasive. |
| Biometric data | Outside AIM educational scope. |
| Social media profiles | Not needed. |
| External account data | Not needed. |
| Parent/guardian personal data beyond approved linking fields | Minimize guardian data. |
| AI provider keys | Server-only secrets. |
| Privileged backend credentials | Server-only secrets. |

### 2.4 AI Provider Data Rules

| Rule | Detail |
|---|---|
| Keys stay in backend | AI provider API keys must never be stored in, passed to, or accessible from Flutter Mobile, React Web, admin UI, or any frontend environment. |
| Minimum provider context | AI Teacher provider requests contain only lesson, skill, and question context needed for the response. |
| No unnecessary identifiers | Student names, emails, full profiles, and personal identifiers are not sent to AI providers. |
| No training without consent | Student learning data must not be submitted to provider training pipelines without explicit approval and appropriate consent. |
| Provider agreement review | Before production use, provider terms and data processing agreements must be reviewed for learner/minor data compatibility. |
| Response logging | AI Teacher responses may be logged for internal quality/safety review according to retention rules. |
| Raw provider output control | Raw provider responses are not blindly forwarded to clients; backend safety validation applies first. |

## Section 3 — Behavior Analysis Rules

### 3.1 Educational-Only Boundary

AIM captures behavior evidence from learning sessions to improve educational adaptation. These signals must never be reframed as psychological, clinical, medical, or diagnostic assessments.

| Signal | Allowed Educational Use | Prohibited Use |
|---|---|---|
| `frustration_score` | Trigger easier content, supportive tone, break suggestion, or remediation. | Clinical stress/anxiety diagnosis or parent wellbeing alert. |
| `hesitation_index` | Inform uncertainty and support needs. | Measure of intelligence, processing speed, or cognitive ability. |
| `sudden_slowdown_flag` | Detect possible fatigue, distraction, or confusion within the session. | Diagnose attention disorders or behavioral conditions. |
| `repeated_errors_flag` | Trigger guided retry or remediation. | Diagnose disability or disorder. |
| `learning_style` | Adapt examples and explanation style silently. | Permanent learner categorization. |
| `avg_speed` | Behavior context only. Must not be used as mastery formula component, level signal, or direct difficulty-increase signal. | Direct measure of intelligence, aptitude, or mastery. |
| `answer_changed_flag` | Contribute to confidence/uncertainty inference. | Cheating or character judgment. |

### 3.2 Behavioral Signal Labeling Rules

All behavior signal values are internal to the AIM Engine and backend. They must be translated before reaching any user.

| Signal | Never Shown To | Allowed Translation |
|---|---|---|
| `frustration_score` float | Students and parents | Student sees supportive recommendation only. Admin may see operational label. |
| `hesitation_index` float | Students and parents | Not surfaced directly. |
| `learning_style` enum | Students as a fixed identity label | May adapt AI Teacher output silently. |
| `weakness_score` float | Students | "Let's review [skill]" or equivalent safe wording. |
| `frustration_score_contribution` | Students and parents | Internal session signal only. |

### 3.3 Consent and Transparency

| Requirement | Rule |
|---|---|
| Informed use | Onboarding or terms must explain that learning signals are collected to personalize education. |
| Plain language | Explanations must be understandable to learners and guardians where applicable. |
| No hidden profiling | AIM must not build profiles beyond documented educational personalization. |
| Right to explanation | The platform should be able to explain recommendations in learner-safe language. |
| Parent/minor consent | If minor learners are included, parent/guardian consent and linking rules must be approved before enrollment. |

## Section 4 — Data Access and Storage Rules

### 4.1 Access Control

| Rule | Detail |
|---|---|
| Backend authorization is final | No role, permission, or data access decision is made by Flutter Mobile, React Web, or admin UI. |
| Cross-student access is always blocked | Students can never access another student's data. This must be enforced server-side. |
| Parent access is conditional | Parent access requires approved consent, linking, and visibility rules. |
| Admin access is audit-logged | Admin access to learner data and exports must be logged. |
| Service accounts have no UI access | Backend service identities exist only in server environment. |
| Secrets are server-only | AI provider keys, database credentials, Supabase service role keys, and privileged secrets must never appear in client-side code, version control, build artifacts, or logs. |

### 4.2 Data Retention

These are planning-level rules. Exact retention periods and deletion workflows are implementation concerns for Phase 1.

| Data Category | Retention Rule |
|---|---|
| Student learning data | Retained according to account and legal retention policy. Deleted or anonymized on verified deletion request where applicable. |
| Audit logs | Append-only and retained according to security policy. Student identifiers may be tombstoned/anonymized where required. |
| AI Teacher exchange logs | Retained for quality/safety review according to approved retention window. |
| Admin override records | Retained as part of auditability. |
| Export data | Minimized, access-controlled, and deleted/anonymized after approved analysis window. |

### 4.3 Data at Rest and in Transit

| Requirement | Rule |
|---|---|
| Encryption in transit | All external API traffic uses HTTPS/TLS. HTTP is not supported. |
| Encryption at rest | Database storage must use encryption at rest. |
| No sensitive data in logs | Server logs must mask student identifiers, provider keys, session tokens, and raw behavior scores. |
| No sensitive data in URLs | Avoid names, emails, or guessable identifiers in URL paths. |
| Secret management | Secrets must be managed through backend environment/secret infrastructure, not committed to code. |

## Section 5 — Minor Learner Protections

AIM may serve learners who are minors. These protections apply wherever minor participation is possible.

| Protection | Rule |
|---|---|
| No direct marketing to learners | No ads, paid-upgrade pressure, or learner-targeted marketing. |
| No social pressure features by default | Leaderboards, peer comparisons, and public social sharing are out of scope unless later approved with safeguards. |
| Parental consent for minors | If learners are under the applicable minor threshold, consent must be approved before enrollment. |
| No engagement dark patterns | No countdown pressure, shame mechanics, streak-loss threats, or manipulative retention tactics. |
| Safe content only | Lesson content, AI Teacher responses, and system messages must be age-appropriate. |
| Data deletion on verified request | Parent/guardian deletion requests for minors must be handled through approved legal/privacy workflow. |

## Section 6 — Incident and Violation Rules

### 6.1 Safety Incident Detection

| Incident Type | Detection Signal | Response |
|---|---|---|
| AI Teacher produces clinical language | Backend validator flags prohibited phrase. | Discard response, substitute safe fallback, log incident. |
| AI Teacher produces off-topic/harmful content | Off-topic detection or review flag. | Discard response, substitute safe fallback, escalate internally if needed. |
| Student sends distressing input | Safety keyword or moderator signal. | AI Teacher does not provide counseling; use approved safe fallback and notify authorized human/admin workflow. |
| Suspected data breach | Audit anomaly or security alert. | Notify project owner/security owner and follow breach procedure. |
| Client attempts unauthorized access | Backend authorization failure or anomaly. | Block request, log event, investigate if repeated. |
| Provider key exposure risk | Secret found in code/log/build artifact. | Revoke/rotate key, remove exposure, audit access. |

### 6.2 Prohibited System Behaviors

| Prohibited Behavior | Reason |
|---|---|
| Optimizing AI Teacher for engagement/session length | Conflicts with educational wellbeing goals. |
| Selling or sharing learner behavior data | Privacy violation. |
| Using response time alone to gate content progression | Speed is not mastery. |
| Applying clinical labels in any user-facing surface | Safety and legal risk. |
| Storing AI provider keys in client-side code | Security non-negotiable. |
| Blocking learner progress permanently based on AIM state | AIM supports learning; it must not create dead ends. |
| Showing one learner's data to another learner | Privacy violation. |
| Letting clients calculate AIM outputs | Violates backend-owned AIM boundary. |
| Creating a separate Student Web App without documented approval | Violates current post-MVP scope. |

## Backend and Client Boundary Rules

| Surface | Allowed | Forbidden |
|---|---|---|
| Flutter Mobile | Display backend-approved data; submit session evidence. | AIM calculations, provider keys, AI provider calls. |
| React Web pilot context | Historical completed pilot surface. | Treating React Web as new post-MVP Student Web App without approval. |
| Admin/internal UI | Role-scoped operational views. | Secret exposure, unaudited overrides, client-side authority. |
| Backend API | Auth, authorization, orchestration, safe response shaping. | Exposing raw provider keys or bypassing AIM safety rules. |
| Python AIM Engine | Backend-owned adaptive intelligence. | Direct client access. |
| AI Teacher Gateway | Backend-only provider proxy. | Client-side provider calls. |

## Non-Goals

This document does not:

- Implement GDPR, COPPA, or local privacy law procedures.
- Provide legal advice.
- Write security middleware.
- Write authentication code.
- Configure encryption.
- Create a Student Web App.
- Implement Flutter Mobile privacy controls.
- Implement React Web privacy controls.
- Define final penetration testing or vulnerability management procedures.
- Move AIM Engine logic into any client.
- Allow AI provider keys or privileged credentials in clients.

## Assumptions

- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless a later documented decision changes this.
- AI provider for AI Teacher Gateway will be selected in Phase 1.
- Parent access remains conditional until consent, linking, and visibility rules are approved.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.
- Phase 0 remains documentation/planning only.

## Open Questions

| Question | Current Handling |
|---|---|
| Which specific privacy law governs the pilot or launch region? | Deferred to legal/privacy review before production launch. |
| Should the platform support student-initiated data export? | Not required for early foundation; recommended before public launch. |
| Which roles may access AI Teacher exchange logs? | Current planning allows scoped internal access; final role scope should be confirmed. |
| How should distressing learner input escalate operationally? | Requires approved safeguarding/admin workflow before production launch. |
| What is the exact deletion response time? | Open for legal/privacy implementation planning. |
| What is the exact retention window for AI Teacher logs? | Open for privacy/security implementation planning. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/roles-and-permissions.md`
- `docs/ai-teacher/behavior-rules.md`
- `docs/data/session-data-capture.md`
- `docs/data/initial-data-model.md`
- `docs/product/notification-scope.md`
- `docs/analytics/reports-scope.md`
- `docs/aim-engine/boundary-and-io-contract.md`
- `docs/api/api-planning-baseline.md`

## Acceptance Notes

- Dependencies checked: P0-001, P0-003, P0-013, P0-014, P0-015, P0-016, P0-017, and P0-021.
- This document covers AI safety, privacy, data minimization, behavior analysis, access control, retention, minor learner protections, incidents, prohibited behaviors, backend/client boundaries, assumptions, open questions, and related documents.
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
- No runtime source code, Student Web App, Flutter AIM logic, database migration, security middleware, or backend implementation was added.
