# Phase 12 — Parent Dashboard Charter

**Date:** 2026-06-20
**Task:** P12-001
**Author:** GHOST3030
**Dependency:** P11-077 (Phase 11 Final Review and Handoff)

---

## 1. Phase 12 Scope

Phase 12 builds the **Parent Dashboard** — a read-only visibility layer that allows parents and guardians to monitor their linked children's learning progress on the AIM Platform.

### In Scope

- Parent onboarding flow
- Parent-child linking and invitation workflows
- Consent management (granting, revoking, displaying consent state)
- Child selector UI for parents with multiple linked children
- Child progress overview (read-only, backend-sourced)
- Skill state visibility (read-only, backend-sourced)
- Weaknesses and recommendations visibility (read-only, backend-sourced)
- Assessment and deadline visibility (read-only, backend-sourced)
- Learning activity summary (read-only, backend-sourced)
- Parent reports (read-only, backend-sourced)
- Notification preference storage and UI (no sending)
- Parent access audit logging
- Privacy and security reviews
- Parent dashboard feature shell and routing
- Parent auth guard UI
- Parent repository and service layers
- Parent permission guards (backend)
- Database migrations for parent-child links and consents
- Design system compliance for all parent UI

### Out of Scope — Exclusions

| Excluded Area | Reason |
|---|---|
| Payments / Billing | Phase 14 |
| Voice AI | Future phase |
| AI Teacher | Future phase |
| AI Prompt Management | Future phase |
| AI Cost Control | Future phase |
| Student Web App | Separate product surface |
| Admin Dashboard expansion | Phase 11 complete; no new admin features in Phase 12 unless explicitly a dependency |
| Full analytics dashboard | Future phase |
| Notification sending | Phase 13 (Phase 12 stores preferences only) |
| Student-facing features | Not parent dashboard scope |

---

## 2. Privacy Boundaries

### Parent Access Model

- Every parent endpoint and UI view is **child-scoped**: a parent sees only data for children explicitly linked to them.
- Parent-child links are established through a backend-controlled invitation and acceptance workflow.
- Consent is required before a parent can view a child's data. Consent state is managed exclusively by the backend.
- Revoking consent immediately removes the parent's access to that child's data.

### Data Visibility Rules

| Data Type | Parent Can View | Parent Can Modify |
|---|---|---|
| Child progress summary | Yes (read-only) | No |
| Skill states | Yes (read-only) | No |
| Weaknesses | Yes (read-only) | No |
| Recommendations | Yes (read-only) | No |
| Assessment results | Yes (read-only) | No |
| Assessment deadlines | Yes (read-only) | No |
| Learning activity logs | Yes (read-only) | No |
| Review schedules | Yes (read-only) | No |
| AIM outputs | Yes (read-only) | No |
| Notification preferences | Yes | Yes (own preferences only) |
| Consent state | Yes (view) | Yes (grant/revoke own consent) |
| Parent profile | Yes | Yes (own profile only) |

### Data the Parent Must Never See

- Other students' data (non-linked children)
- Internal AIM scoring algorithms or weights
- Backend service-role credentials
- Admin-only operational data
- Raw database records outside approved API responses

---

## 3. Parent Authority Limits

### Backend Is Final Authority

The backend is the sole authority for:

- Parent-child relationship validation
- Consent state and enforcement
- Child access scope determination
- Progress calculation and state
- Skill state computation
- Weakness identification
- Recommendation generation
- Review schedule management
- Assessment scoring and results
- Deadline validity and late-state determination
- All AIM outputs and decisions

### Parent UI Restrictions

The parent UI **must not**:

- Calculate mastery levels
- Calculate or determine weaknesses
- Calculate placement scores
- Calculate assessment scores or correctness
- Determine deadline validity or late state
- Generate recommendations
- Compute review schedules
- Mutate progress or skill states
- Write assessment results
- Override AIM outputs
- Bypass consent checks
- Access data for non-linked children

The parent UI **may only**:

- Display backend-approved child data
- Request backend-approved parent actions (link, consent, preferences)
- Manage consent and preference UI through protected APIs
- Show safe, read-only summaries sourced from backend responses

---

## 4. Design System Requirements

All Phase 12 UI must follow the approved AIM design system from `docs/design/source/aim-design-system`.

### Required

- Approved design tokens (colors, typography, spacing, radius, elevation)
- Shared layout components
- Shared cards, tables, forms, badges, dialogs
- Responsive layout rules
- Arabic/RTL readiness
- Accessible labels, controls, and keyboard navigation
- Consistent loading, empty, error, and forbidden states

### Prohibited

- One-off styling
- Hard-coded colors outside design tokens
- Custom spacing outside tokens
- Inconsistent button, input, or table patterns
- Layout patterns that break RTL
- Components that bypass the design system

---

## 5. Dependencies from Previous Phases

### From Phase 11 (Admin Dashboard)

- Admin dashboard architecture patterns (Next.js 15 app structure)
- Shared UI component patterns (AdminTable, AdminBadge, etc. — parent equivalents to be created)
- API client patterns (typed decoders, Bearer auth, error handling)
- Phase 12 readiness checklist (P11-076)

### From Phase 10 (Assessment Engine)

- Assessment tables (assessments, assessment_results, assessment_deadlines)
- Assessment backend services and APIs

### From Earlier Phases

- Auth system (Supabase Auth, JWT, role-based access)
- Student progress tables and services
- Skill state and weakness tracking
- Curriculum structure (courses, chapters, lessons, skills)
- Review schedule system
- AIM engine outputs

---

## 6. Backend API Requirements

### Parent Endpoints Must Have

- Authentication guard (valid JWT, parent role)
- Relationship guard (parent is linked to the requested child)
- Consent guard (active consent exists for the requested child)
- Child-scope guard (response filtered to only the requested child's data)
- DTO validation on all inputs
- No exposure of secrets or sensitive internal payloads

### API Categories

| Category | Access Pattern |
|---|---|
| Parent-child links | CRUD for own links only |
| Invitations | Send/accept/reject for own invitations only |
| Consent | Grant/revoke own consent only |
| Child progress | Read-only, child-scoped |
| Child skills | Read-only, child-scoped |
| Child weaknesses | Read-only, child-scoped |
| Child recommendations | Read-only, child-scoped |
| Child assessments | Read-only, child-scoped |
| Child deadlines | Read-only, child-scoped |
| Child activity | Read-only, child-scoped |
| Parent reports | Read-only, child-scoped |
| Notification preferences | Read/write own preferences only |

---

## 7. Phase 12 Task Categories

| Category | Description |
|---|---|
| Charter and planning | Scope definition, design system review |
| Database migrations | Parent-child links, consents, constraints |
| Backend services | Link service, consent service, report service, assessment summary service |
| Permission guards | Auth, relationship, consent, child-scope guards |
| Repository layer | Parent data access layer |
| UI shell and routing | Feature shell, auth guard UI, child selector |
| UI views | Progress, skills, weaknesses, assessments, deadlines, activity, reports |
| Consent UI | Consent management interface |
| Tests | Consent tests, invitation tests, assessment access tests |
| Notification readiness | Preference storage/display (no sending) |
| Quality reviews | Design system review, output completeness, final review |

---

## 8. Phase 13 Boundary

Phase 12 prepares for Phase 13 (Notifications) by:

- Storing notification preferences in the database
- Displaying notification preference UI
- Documenting notification readiness requirements

Phase 12 **does not**:

- Send notifications
- Implement notification delivery infrastructure
- Create notification templates
- Integrate with email, SMS, or push services

---

## 9. Security Commitments

- No secrets, service-role keys, database credentials, AI provider keys, or production tokens in code or commits
- All parent endpoints require authentication
- All child data endpoints require relationship and consent verification
- Parent access is logged for auditability
- No privilege escalation paths from parent role to admin or student roles
- Input validation on all parent-submitted data
- No trust of client-submitted child links, consent state, progress, or assessment results

---

## 10. Done Criteria for Phase 12

Phase 12 is complete when:

- All Phase 12 tasks in the Notion database are Done
- All expected outputs exist in the repository
- All UI follows the AIM design system
- All parent endpoints are protected with auth, relationship, consent, and child-scope guards
- No client-side learning/assessment/AIM authority exists
- Privacy and security reviews are completed
- Output completeness review is completed
- Final review and handoff document is produced
