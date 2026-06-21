# Phase 11 — Admin Dashboard Charter

**Version:** 1.0
**Phase:** 11
**Status:** Active
**Dependency:** Phase 10 (P10-076 — Phase 10 Final Review and Handoff)

---

## 1. Phase 11 Goal

Phase 11 builds the Admin Dashboard and admin management workflows for AIM Platform.

The admin dashboard supports controlled management and inspection of:

- Users, roles, and permissions
- Courses, chapters, lessons, and lesson content blocks
- Skills and question bank
- Quizzes, exams, and deadlines
- Assessment results and placement results
- Student progress, skill states, weaknesses, and recommendations
- Session summaries and AIM audit logs
- Platform activity logs and basic operational reports

---

## 2. Admin Authority Boundary

### 2.1 Backend Remains Final Authority

The backend is the sole authority for:

| Domain | Authority |
|---|---|
| Identity | Backend resolves user identity from JWT; admin UI never supplies student_id or session_id |
| Permissions | Backend enforces role guards on every admin endpoint |
| User status | Backend controls active/inactive/banned status |
| Curriculum publishing | Backend controls published/draft state |
| Assessment grading | Backend grades all quiz and exam attempts |
| Deadline enforcement | Backend decides pass/fail, late, or expired status |
| Progress | Backend calculates all progress metrics |
| Skill states | Backend determines mastery and skill state |
| Weaknesses | Backend identifies and tracks weaknesses |
| Recommendations | Backend generates all recommendations |
| Review schedules | Backend manages spaced repetition schedules |
| AIM outputs | AIM Engine produces all AI-driven outputs |

### 2.2 Admin UI Must Not Calculate

Admin UI must never locally compute:

- Mastery
- Weakness
- Placement score
- Assessment score
- Correctness of any answer
- Deadline validity or expiry
- Recommendations
- Review schedule dates
- AIM decisions or outputs
- Privileged role state

### 2.3 Admin UI Responsibilities

Admin UI may:

- Display backend-returned values as read-only
- Send admin actions through protected backend APIs
- Paginate, filter, and sort backend-returned lists
- Trigger backend-controlled publish/unpublish/archive actions
- View AIM audit logs and session summaries (read-only)

---

## 3. Design System Rule

All UI tasks in Phase 11 must follow the AIM design system from:

```
docs/design/source/aim-design-system
```

Every UI task must use:

- Approved design tokens
- Approved color palette
- Approved typography scale
- Approved spacing scale
- Approved border-radius and elevation tokens
- Shared admin layout components
- Shared table, form, card, badge, and dialog components
- Responsive layout rules
- Arabic/RTL readiness
- Accessibility-safe labels, controls, and keyboard flow
- Consistent loading, empty, error, and forbidden states

Do not use:

- One-off inline styles or random color values
- Custom spacing outside design tokens
- Inconsistent button, input, or table patterns
- Layout patterns that break RTL rendering
- UI components that bypass the design system

Stop if a UI task cannot follow the design system.

---

## 4. Phase 11 Scope

### 4.1 In Scope

| Area | Description |
|---|---|
| Admin Shell | Navigation, layout, auth guard, role check |
| Users API | List, detail, status management endpoints (admin-only) |
| Roles & Permissions | View and assign roles via backend API |
| Courses, Chapters, Lessons | List, detail, publish/unpublish admin UI and API |
| Content Blocks | List and inspect lesson content blocks |
| Skills | List and inspect skill records |
| Question Bank | List, create, edit, validate questions (via backend API) |
| Quizzes & Exams | List, create, edit, configure assessments |
| Deadlines | List, create, edit deadline assignments |
| Assessment Results | Read-only results view |
| Placement Results | Read-only placement history view |
| Student Progress | Read-only progress view |
| Skill States | Read-only skill state view |
| Weaknesses | Read-only weakness view |
| Recommendations | Read-only recommendation view |
| Session Summaries | Read-only AIM session summary view |
| AIM Audit Logs | Read-only audit log view |
| Activity Logs | Read-only platform activity log view |
| Basic Reports | Operational summary reports (read-only) |
| Security Review | Admin permission audit and penetration readiness review |
| Output Review | Phase 11 output completeness review |
| Final Review | Phase 11 final review and handoff document |

### 4.2 Explicitly Out of Scope

The following are **excluded** from Phase 11:

| Excluded Area | Reason |
|---|---|
| Parent Dashboard | Phase 12+ scope |
| Payment / Billing | Phase 13+ scope |
| AI Teacher / Voice AI | Phase 9 scope — not admin dashboard |
| AI Prompt Management | Future phase scope |
| AI Cost Control | Future phase scope |
| Student Web App | Student-facing scope — not admin |
| Full Analytics Platform | Future phase scope |
| Notification Management UI | Readiness documentation only in Phase 11 |
| Admin Mobile App | Out of scope entirely |

---

## 5. Phase 11 Dependencies

| Dependency | Output | Status |
|---|---|---|
| P10-076 | `docs/phase-10/final-review.md` | Required — Phase 10 complete |

Phase 11 begins only after Phase 10 final review and handoff is complete.

---

## 6. Phase 11 Task Groups

| Group | Task Range | Area |
|---|---|---|
| Foundation | P11-001..P11-008 | Charter, capability map, design system, architecture, shell |
| Users | P11-009..P11-019 | Users API and UI |
| Curriculum | P11-020..P11-030 | Courses, chapters, lessons, content blocks, skills |
| Question Bank | P11-031..P11-036 | Question management |
| Assessments | P11-037..P11-047 | Quizzes, exams, deadlines, results, publishing |
| Progress & AIM | P11-048..P11-057 | Progress, skill states, weaknesses, recommendations, sessions, audit logs |
| Reports | P11-058..P11-063 | Activity logs and basic reports |
| Reviews | P11-064..P11-080 | Security review, output review, final review, readiness notes |

---

## 7. Security Requirements

Every admin endpoint must:

- Require authentication (JWT guard)
- Require admin role (role guard — `admin` or higher)
- Validate all request DTOs
- Never trust client-supplied identity fields (student_id, session_id, user_id in body)
- Never expose AI provider keys, database credentials, or service-role secrets
- Log admin actions to the AIM audit log

Admin UI must:

- Redirect unauthenticated users to login
- Show a forbidden state for insufficient roles
- Never pass raw JWT claims as editable form fields
- Never surface backend secrets in any response

---

## 8. No-Client-Authority Rules

The admin dashboard must never:

1. Calculate or display a locally computed mastery score
2. Calculate or display a locally computed weakness flag
3. Calculate or display a locally computed placement result
4. Calculate or display a locally computed assessment grade
5. Evaluate correctness of any student answer
6. Compute whether a deadline has passed
7. Generate or modify recommendations locally
8. Generate or modify review schedule dates locally
9. Mutate AIM Engine outputs
10. Mutate progress calculations
11. Mutate skill state directly in the database

All of these are computed by the backend and displayed read-only in the admin UI.

---

## 9. Secrets Policy

The following must never appear in any Phase 11 commit:

- Supabase service-role key
- Supabase anon key used in server contexts
- PostgreSQL connection strings with credentials
- OpenAI, Anthropic, ElevenLabs, or any AI provider API keys
- STT/TTS provider credentials
- GitHub personal access tokens
- JWT secrets
- Any `.env` value from a production environment

Use environment variable references (e.g., `process.env.OPENAI_API_KEY`) only. Never hardcode values.

---

## 10. Done Definition for Phase 11

A Phase 11 task is Done only when:

- [ ] Claimed in Notion before editing
- [ ] Assigned to the implementing agent before editing
- [ ] Status set to In Progress before editing
- [ ] Dependencies verified as complete (Notion status + GitHub branch)
- [ ] Exact prompt section followed
- [ ] Implementation is Phase 11 scope-safe
- [ ] UI tasks follow AIM design system
- [ ] Admin permissions are protected on every endpoint
- [ ] No client-side authority introduced
- [ ] Future phase scope avoided
- [ ] Secrets excluded from all commits
- [ ] Checks run or documented
- [ ] Files committed
- [ ] Branch pushed to GitHub
- [ ] Completion comment added to Notion
- [ ] Status set to Done after push

---

*Charter created: Phase 11 P11-001*
*Depends on: P10-076 (Phase 10 Final Review and Handoff)*
