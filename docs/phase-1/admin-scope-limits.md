# Admin Dashboard Scope Limits

## Purpose

This document defines the scope limits for the AIM Platform Phase 1 Admin Dashboard.

The Phase 1 Admin Dashboard is an internal foundation surface only. It exists to establish the project shell, layout boundaries, placeholder navigation, and future integration direction.

It is not a full institute management platform.

## Phase 1 Position

The Admin Dashboard in Phase 1 is limited to:

- Internal project shell.
- Placeholder layout.
- Placeholder routes.
- Placeholder menu groups.
- Backend API client foundation.
- Safe scope documentation.
- Future admin integration boundary.

It must not become a production operations system during Phase 1.

## Explicitly Allowed in Phase 1

The following are allowed:

```text
apps/admin-dashboard/
```

Allowed capabilities:

- Internal dashboard landing page.
- Basic admin layout shell.
- Placeholder sidebar or navigation.
- Placeholder route pages.
- Placeholder module labels.
- Backend API client foundation.
- Environment placeholder for Backend API base URL.
- Static documentation explaining future boundaries.
- Non-authoritative role menu labels.

These are scaffolding only.

## Explicitly Excluded from Phase 1

The following are not allowed in Phase 1.

### Full Institute Management

Phase 1 Admin Dashboard must not implement a full institute management system.

Excluded examples:

- Student enrollment operations.
- Teacher assignment workflows.
- Class scheduling.
- Attendance management.
- Billing or subscription management.
- Branch/campus management.
- Staff HR workflows.
- Full operational CRM.
- Production institute administration.

### Full Analytics Warehouse

Phase 1 Admin Dashboard must not implement a full analytics warehouse.

Excluded examples:

- Production analytics warehouse.
- Advanced BI dashboards.
- Data lake views.
- Cross-cohort deep reporting.
- Longitudinal learner analytics warehouse.
- Financial analytics.
- Predictive administrative analytics.
- Export-heavy reporting systems.

Phase 1 may only include placeholder analytics labels if needed.

### Teacher/Classroom System

Phase 1 Admin Dashboard must not implement a teacher/classroom system unless later approved.

Excluded examples:

- Teacher lesson assignment workflows.
- Classroom rosters.
- Live class management.
- Teacher grading console.
- Teacher scheduling.
- Teacher-student chat workflows.
- Classroom attendance.
- Instructor-facing full dashboard.

A future approved phase may define these separately.

### Student Web App

The Admin Dashboard must not become or include a Student Web App.

Excluded examples:

- Learner lesson-taking UI.
- Learner placement flow.
- Learner quiz-taking UI.
- Learner dashboard.
- Learner progress homepage.
- Parent-facing learner portal.
- Web-based AI tutor learning surface.

The approved Phase 1 learner client remains Flutter Mobile.

### AIM Logic

The Admin Dashboard must not calculate AIM outputs.

Forbidden calculations include:

- Mastery.
- Level.
- Weakness.
- Difficulty.
- Retention.
- Recommendations.
- Frustration.
- Learning-path decisions.
- Adaptive session outcomes.

Admin may eventually display backend-approved summaries only.

### Backend Authorization

The Admin Dashboard must not become the source of authorization truth.

Forbidden behavior:

- Client-side role enforcement as final authority.
- Client-side permission decisions as final authority.
- Local admin privilege elevation.
- Hardcoded admin access.
- Trusting local storage for role authority.
- Bypassing Backend API authorization.

Backend API remains the final authorization boundary.

### Secrets and Credentials

The Admin Dashboard must not contain secrets.

Forbidden items:

- Supabase service-role keys.
- Supabase database passwords.
- AI provider keys.
- JWT secrets.
- API tokens.
- Production credentials.
- Private certificates.
- Hardcoded admin credentials.

All sensitive configuration must remain server-side and environment-controlled.

## Placeholder-Only Rule

Any Admin Dashboard module created in Phase 1 must be a placeholder unless a later task explicitly approves implementation.

Allowed placeholder examples:

```text
Students — Placeholder
Content — Placeholder
Reports — Placeholder
Review Queue — Placeholder
Settings — Placeholder
Audit Logs — Placeholder
```

Forbidden during Phase 1:

```text
Real student management
Real content publishing
Real audit-log ingestion
Real user permission editing
Real report generation
Real production workflow automation
```

## Internal Foundation Surface

The Admin Dashboard may support internal project validation by showing:

- Shell renders.
- Layout exists.
- Placeholder routes work.
- Backend API client foundation compiles.
- Role menu placeholders are visible.
- Scope restrictions are documented.

It must not manage real users, learners, courses, payments, or institutional operations.

## Relationship to Backend API

The Admin Dashboard must interact with the Backend API only through approved contracts.

Rules:

- Backend API is the source of admin data.
- Backend API validates auth and authorization.
- Backend API filters learner-safe and admin-safe data.
- Backend API protects internal AIM fields.
- Admin Dashboard must not query Supabase directly for protected records.
- Admin Dashboard must not call AIM Engine directly.
- Admin Dashboard must not call AI Teacher providers directly.

## Relationship to AIM Engine

AIM Engine remains backend/internal.

The Admin Dashboard may eventually display backend-approved AIM summaries, but must not:

- Calculate AIM metrics.
- Mutate AIM state directly.
- Read raw internal learner modeling data directly.
- Send direct requests to AIM Engine.
- Expose learner-private AIM internals without backend filtering.

## Relationship to AI Teacher

AI Teacher access remains backend-mediated.

The Admin Dashboard must not:

- Call AI providers directly.
- Store provider keys.
- Expose hidden prompts.
- Display raw provider traces.
- Manage production AI prompt pipelines unless later approved.
- Act as a general chatbot console.

## Relationship to Learner Privacy

Admin Dashboard placeholders must not expose real learner-private data.

Forbidden in Phase 1:

- Real learner profiles.
- Real parent data.
- Real submissions.
- Real messages.
- Real voice logs.
- Real assessment answers.
- Raw AIM state.
- Raw weakness/frustration/retention internals.

If demo labels are needed, use fake placeholder copy only.

## Future Expansion

Future phases may add admin capabilities only after explicit approval.

Any future admin expansion must define:

- Scope.
- Backend API contract.
- Authorization model.
- Data exposure rules.
- Audit/logging requirements.
- Privacy boundaries.
- Testing requirements.
- Migration impact if database changes are needed.

## Required Review Before Future Admin Work

Before implementing any real admin module, verify:

```text
[ ] A specific task approves the module.
[ ] Backend API endpoint exists or is explicitly scoped.
[ ] Authorization is backend-enforced.
[ ] No client-side AIM calculations are added.
[ ] No Student Web App scope is introduced.
[ ] No secrets are committed.
[ ] Data exposure follows safe-field contracts.
[ ] Learner privacy is protected.
[ ] Audit/logging implications are reviewed.
```

## Acceptance Notes

- Phase 1 Admin Dashboard is internal foundation only.
- Full institute management is excluded.
- Full analytics warehouse is excluded.
- Teacher/classroom system is excluded unless later approved.
- Student Web App is excluded.
- Client AIM logic is excluded.
- Backend authorization remains final.
- Secrets are forbidden.
- Scope limits are explicit.
- No runtime dashboard module implementation is added by this document.
- No database migration is added.
- No credentials are committed.
