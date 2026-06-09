# AIM Parent Journey and Weekly Report Scope

## Purpose

This document defines the optional parent or guardian journey for AIM, including learner linking, progress visibility, weekly report scope, alerts, notification boundaries, privacy rules, and restrictions.

It is the parent/guardian planning reference for post-MVP Phase 1, but parent access remains conditional.

## Scope

This is Phase 0 planning documentation only.

This document does not implement:

- Backend runtime code.
- NestJS API code.
- FastAPI routes.
- Flutter Mobile code.
- React Web code.
- Parent portal runtime code.
- Admin dashboard runtime code.
- Database migrations.
- AIM Engine runtime code.
- AI Teacher Gateway runtime code.
- A separate Student Web App.

Parent or guardian access is conditional and should be included only if it supports learning without adding unsafe privacy, consent, or implementation risk.

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

Parent access is not automatically part of Phase 1 foundation. It remains conditional until consent, linking, visibility, notification, and privacy rules are explicitly approved.

This document must not be interpreted as creating a parent portal, public web portal, or Student Web App.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P0-001 | `docs/product/vision.md` | Checked and used as source of truth. |
| P0-001 | `docs/product/non-negotiables.md` | Checked for AIM/client/privacy guardrails. |
| P0-003 | `docs/product/roles-and-permissions.md` | Checked for parent role and visibility boundaries. |
| P0-004 | `docs/product/mvp-scope.md` | Checked for completed pilot and post-MVP scope. |
| P0-004 | `docs/product/out-of-scope.md` | Checked for out-of-scope boundaries. |
| P0-005 | `docs/journeys/student-journey.md` | Checked for learner journey and progress touchpoints. |
| P0-020 | `docs/product/notification-scope.md` | Checked for parent notification boundaries. |
| P0-021 | `docs/analytics/reports-scope.md` | Checked for report visibility rules. |
| P0-022 | `docs/security/ai-safety-privacy-rules.md` | Checked for privacy, consent, and learner-safe language rules. |

## Parent Access Decision

Parent or guardian access is conditional.

| Decision Area | Current Position |
|---|---|
| Phase 1 foundation requirement | Not required to validate the core AIM adaptive learning loop. |
| If included | Keep access limited to verified linked learner summaries and safe weekly reports. |
| If deferred | Student journey and core AIM validation can continue without parent implementation. |
| Safety rule | Parent-facing language must stay educational, supportive, non-clinical, non-medical, and non-diagnostic. |
| Privacy rule | Parent access requires explicit approved linking and backend ownership validation. |
| Notification rule | Parent notifications are disabled unless parent access and notification scope are approved. |

## Parent Journey Summary

If parent access is included, the journey is:

```text
Invite
-> Verify parent account
-> Link to learner through approved flow
-> View limited learner-safe dashboard
-> Receive weekly progress report if enabled
-> Review safe recommendations
-> Support learner practice
-> Contact admin/support if needed
```

The parent experience should help support consistent learning without exposing raw AIM internals, sensitive learner evidence, behavior scores, hidden weights, AI provider data, or other learners' data.

## Parent Goals

| Goal | Conditional Support |
|---|---|
| Know whether learner is participating | Weekly completion and practice summary. |
| Understand progress at high level | Learner-safe skill and lesson progress summaries. |
| Support practice at home | Simple recommended support actions. |
| Notice when encouragement may help | Safe missed-practice or review-needed notice, if enabled. |
| Protect learner privacy | Limited visibility and no raw audit access. |
| Avoid pressure or shame | Supportive wording only. |

## Journey Stages

| Stage | Parent Action | System Response | Boundary |
|---|---|---|---|
| Invitation | Receives parent access invite if approved. | Explains limited parent visibility. | No public self-linking without verification. |
| Account setup | Signs in or creates parent account. | Confirms identity and consent flow. | Backend verifies role and ownership. |
| Learner linking | Links to learner through admin-approved or secure invite flow. | Shows linked learner summary only. | Parent sees only explicitly linked learner data. |
| Dashboard | Views high-level progress. | Shows lessons completed, practice status, and next support suggestion. | No raw attempt logs. |
| Weekly report | Reads weekly summary. | Shows progress, practice pattern, review needs, and safe next steps. | Educational language only. |
| Alerts | Receives limited alerts if enabled. | Shows missed-practice or report-ready notice. | Alerts must not shame or diagnose learner. |
| Support action | Encourages learner to practice or review. | Parent can see updated summary later. | Parent does not submit attempts for learner. |
| Help request | Contacts admin/support if needed. | Admin/support handles issue. | Support access follows role permissions. |
| Access revoked | Parent loses visibility. | Backend enforces revoked link status. | No cached sensitive access. |

## Learner Linking Rules

Parent-learner linking must be conservative.

- A parent can view only learners explicitly linked to that parent account.
- Linking should require a secure invite, admin approval, guardian verification, or equivalent approved flow.
- A learner must not become visible through email guessing.
- A learner must not become visible through public search.
- Parent access should be revocable by project owner or approved admin role.
- Every linked relationship should have a clear source, timestamp, status, and approver where applicable.
- Cross-account access must be backend-authorized.
- Cross-account access should be audit-logged.
- Parent links must not expose other learner records.
- Parent links must not expose raw student identity data beyond approved display fields.

## Parent Dashboard Scope

Parent dashboard may show:

- linked learner display name
- current lesson status
- lessons completed this week
- practice sessions completed this week
- high-level skill progress summary
- current learner-safe recommendation
- suggested parent support action
- missed practice indicator if notifications are enabled
- weekly report availability
- last updated timestamp

Parent dashboard must not show:

- other learners
- raw AIM audit logs
- raw behavior evidence
- detailed response-time traces
- raw mastery formula internals
- raw confidence, retention, weakness, or frustration scores
- raw AI Teacher prompts or provider output
- admin controls
- content manager tools
- AI provider keys
- backend credentials
- Supabase service role keys
- clinical, medical, psychological, or diagnostic labels

## Weekly Report Scope

A weekly parent report should be short and supportive.

| Section | Included Content | Excluded Content |
|---|---|---|
| Practice summary | Sessions completed, lessons attempted, completion trend. | Full raw attempt table. |
| Learning progress | Skills practiced, simple improvement notes, review needs. | Internal scoring formulas or raw audit logs. |
| AIM recommendation | Learner-safe next step such as review, continue, or challenge. | Decision conflict internals or raw AIM weights. |
| Support suggestion | One or two practical ways to support practice. | Pressure, blame, or comparison to other learners. |
| Alerts | Missed practice or support-needed signal if enabled. | Clinical, medical, or diagnostic statements. |
| Privacy note | Reminder that report is limited to linked learner progress. | Sensitive internal system details. |

## Parent-Facing Language Rules

Parent-facing language should say:

- "Needs more practice with..."
- "A review activity is recommended."
- "AIM needs a few more answers before making a strong recommendation."
- "The learner may benefit from a short guided review."
- "This week included steady practice."
- "A short review may help keep this skill fresh."
- "Encourage the learner to continue at a comfortable pace."

Parent-facing language must not say:

- The learner has a medical or psychological condition.
- The learner is lazy, bad, incapable, weak as a person, or failing.
- Fast answers mean mastery.
- Slow answers mean low mastery.
- The parent should pressure the learner to move faster.
- The learner has anxiety, ADHD, dyslexia, disorder, disability, or any diagnostic label.
- The learner is worse than other learners.
- Raw AIM scores or hidden weights.

## Alerts and Notifications

Parent alerts are optional and should remain minimal.

Allowed alert types if parent notifications are approved:

- Weekly report ready.
- Missed practice reminder.
- Repeated review need.
- Lesson completion milestone.
- Admin/support message if needed.

Disallowed alert types:

- Public ranking or comparison.
- Shame-based warnings.
- Clinical, medical, psychological, or diagnostic claims.
- High-frequency nudges that create pressure.
- Raw performance dumps.
- Raw behavior score alerts.
- AI Teacher raw conversation alerts.
- Any alert exposing hidden AIM internals.

Notification timing, channels, and opt-out rules are defined in `docs/product/notification-scope.md`.

## Privacy Boundaries

Parent access must preserve learner privacy.

- Show summaries instead of raw logs by default.
- Limit visibility to linked learners only.
- Keep sensitive AIM audit details internal.
- Avoid unnecessary personal data.
- Do not expose AI provider keys, backend secrets, Supabase service keys, or service credentials.
- Use backend authorization for every parent data request.
- Audit cross-account access where implementation supports it.
- Keep parent reports learner-safe.
- Do not expose raw behavior scores.
- Do not expose other learners or cohort comparisons.
- Do not expose admin/internal notes unless explicitly approved.

## Parent Actions

Parents may:

- View linked learner progress summaries.
- Read weekly reports.
- Receive limited notifications if enabled.
- Encourage learner practice.
- View learner-safe support suggestions.
- Contact admin/support through approved channels if implemented.

Parents must not:

- Submit answers for the learner.
- Start or complete sessions for the learner.
- Change mastery, difficulty, retention, weakness, or recommendations.
- Override AIM Engine decisions.
- View raw internal AIM audit logs.
- View raw behavior scores.
- View raw attempt logs unless later explicitly approved by privacy planning.
- View other learners.
- Manage lesson content.
- Access admin tools.
- Access AI provider keys, backend credentials, or service role keys.

## Error and Recovery States

| Situation | Parent Experience | System Handling |
|---|---|---|
| Link invite expired | Parent asks for a new invite. | Admin/support can resend or recreate approved link. |
| Wrong learner linked | Parent sees no sensitive details until verified. | Admin/support reviews and corrects relationship. |
| Learner data unavailable | Parent sees simple unavailable message. | Backend avoids leaking details. |
| Report delayed | Parent sees last available report date. | Backend generates or retries report later. |
| Access revoked | Parent loses dashboard/report access. | Backend enforces link status. |
| Parent unauthenticated | Parent is sent to sign in. | Destination is revalidated after auth. |
| Parent not linked | Parent sees no learner data. | Backend blocks access. |

## Phase 1 Acceptance Criteria

Parent journey planning is ready when:

- Parent access is clearly conditional.
- Parent access can be deferred without blocking the core student journey.
- Learner linking rules are documented.
- Weekly report scope is documented.
- Parent dashboard visibility is limited and learner-safe.
- Alert types and privacy boundaries are documented.
- Parent actions and restrictions align with `docs/product/roles-and-permissions.md`.
- Notification boundaries align with `docs/product/notification-scope.md`.
- Report boundaries align with `docs/analytics/reports-scope.md`.
- Scope aligns with `docs/product/mvp-scope.md` and `docs/product/out-of-scope.md`.
- No runtime code or Student Web App is created by this planning task.
- No AIM logic is moved into parent-facing surfaces.

## Non-Goals

This document does not:

- Require parent access in Phase 1 foundation.
- Implement a parent portal.
- Create a Student Web App.
- Create backend runtime code.
- Create NestJS API code.
- Create FastAPI routes.
- Create database migrations.
- Create Flutter Mobile code.
- Create React Web code.
- Move AIM Engine logic into any client.
- Finalize notification delivery channels.
- Finalize legal consent language.
- Define final UI design for parent surfaces.

## Assumptions

- React Web was the completed MVP pilot learner interface.
- FastAPI was the completed MVP pilot backend API.
- Flutter Mobile is the approved post-MVP Phase 1 learner client.
- NestJS + TypeScript is the post-MVP Phase 1 Backend API.
- Python AIM Engine remains backend-owned.
- Supabase PostgreSQL/Auth remain the default unless a later documented decision changes this.
- Parent access can be deferred if it increases privacy or implementation risk.
- If parent access is included, it is limited to linked learner summaries.
- Admin/project owner controls parent linking and revocation unless a safer self-service process is approved later.
- Parent-facing reports support learning consistency, not surveillance or pressure.
- Backend authorization remains the source of truth for access.
- No separate Student Web App is planned for post-MVP unless a later documented product decision changes this.
- Phase 0 remains documentation/planning only.

## Open Questions

| Question | Current Handling |
|---|---|
| Is parent access included in first Phase 1 implementation or deferred? | Keep conditional until scope review. |
| What proof is required to link a parent to a learner? | Define during auth/data/privacy planning before implementation. |
| Should weekly reports be in-app only, email, or both? | Defer to notification scope and security/privacy planning. |
| Can learners see the same weekly report parents see? | Prefer transparency, but finalize in reporting scope. |
| Are parent alerts enabled in first implementation? | Keep optional and minimal unless notification scope confirms value. |
| Should parent access require learner consent for older learners? | Legal/privacy review required. |
| What should happen when a learner account is deleted or deactivated? | Parent link should be revoked or hidden by backend policy. |

## Related Documents

- `docs/product/vision.md`
- `docs/product/non-negotiables.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/mvp-scope.md`
- `docs/product/out-of-scope.md`
- `docs/journeys/student-journey.md`
- `docs/product/notification-scope.md`
- `docs/analytics/reports-scope.md`
- `docs/security/ai-safety-privacy-rules.md`
- `docs/data/initial-data-model.md`
- `docs/api/api-planning-baseline.md`
- `docs/tasks/phase_0_task_prompts.md`

## Acceptance Notes

- Dependencies checked: P0-001, P0-003, P0-004, P0-005, P0-020, P0-021, and P0-022.
- This document has a title, purpose, scope, current product direction, parent access decision, parent journey, weekly report scope, privacy boundaries, assumptions, non-goals, and open questions.
- Parent access remains conditional.
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
- No runtime source code, Student Web App, parent portal implementation, Flutter AIM logic, database migration, or backend implementation was added.
