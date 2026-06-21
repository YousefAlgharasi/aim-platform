# Phase 7 — Student Web App Charter

**Phase:** 7 (Deferred)
**Status:** Approved
**Date:** 2026-06-21

## Purpose

Phase 7 builds the Student Web App — a browser-based learning experience for AIM Platform students. It provides web access to authentication, dashboard, progress tracking, placement, curriculum, lessons, practice, assessments, AI Teacher interaction, notifications, billing, reports, and support.

## Deferred Execution

Phase 7 is intentionally deferred. It must execute only after all Phase 1–18 final reviews are complete. This ensures the full backend, AIM Engine, mobile apps, admin dashboard, analytics, billing, notifications, operations, and all supporting infrastructure are stable before the web client is built on top of them.

### Prerequisites

- All Phase 1–18 final reviews complete
- `docs/phase-18/final-review.md` exists
- P18-091 output exists
- Phase 7 explicitly approved to run late

## Scope

### In Scope

| Domain | Web Features |
|--------|-------------|
| Authentication | Login, register, forgot password, session management |
| Dashboard | Home, progress summary, recommendations, deadlines, activity |
| Progress | Mastery display, skill state, weakness view, streak tracking |
| Placement | Entry, question UI, answer submission, result display |
| Curriculum | Subject browse, unit/lesson listing, lesson detail |
| Lessons | Lesson viewer, content rendering, completion tracking |
| Practice | Practice session UI, question rendering, answer submission |
| Assessments | Assessment entry, question UI, submission, result display |
| AI Teacher | Chat interface, conversation history, session management |
| Notifications | Notification list, read/unread state, preference management |
| Billing | Plan display, subscription status, payment history |
| Reports | Progress reports, performance summaries |
| Support | Ticket creation, ticket listing, feedback submission |
| Profile | Profile display/edit, settings, locale/language |

### Out of Scope

- Backend API implementation (already complete in Phases 1–18)
- AIM Engine logic
- Admin dashboard features
- Mobile app features
- Database schema changes
- Infrastructure/deployment changes

## Architecture

### Browser Client Only

The Student Web App is a React single-page application that:

- Consumes backend REST APIs exclusively
- Uses Supabase Auth for authentication (via backend)
- Renders UI using the AIM design system
- Supports English and Arabic (RTL)
- Works responsively across desktop, tablet, and mobile browsers

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript |
| Styling | CSS Modules + AIM design tokens |
| Routing | React Router |
| API Client | Typed fetch wrapper over backend API |
| Auth | Supabase Auth (browser client) |
| State | React Context + hooks |
| Testing | Jest + React Testing Library |

## Authority Boundaries

The Student Web App must NOT:

- Calculate or mutate mastery, weakness, difficulty, or recommendations
- Compute review schedules or progress values
- Score placement tests or assessments
- Determine pass/fail outcomes
- Modify billing state or entitlements
- Trigger notification delivery
- Produce analytics outputs
- Call the database directly
- Call AIM Engine directly
- Store service-role keys or provider keys

The backend/AIM Engine remains the sole authority for all learning decisions, scoring, billing, and data mutations.

## Design System

All UI must follow `docs/design/source/aim-design-system`:

- Design tokens: colors, spacing, typography, radius, shadows
- Component contracts: buttons, forms, feedback, navigation, learning
- Layout rules: responsive, mobile-first
- Arabic/RTL readiness
- Accessibility: WCAG 2.1 AA compliant labels and controls
- Consistent loading, empty, error, forbidden, and blocked states

## Security

- No secrets in client code
- No service-role keys, provider keys, or database credentials
- Token storage via secure browser mechanisms only
- XSS prevention through React's default escaping
- CSRF protection via backend token validation
- All sensitive operations go through backend APIs

## Task Organization

Phase 7 tasks follow this progression:

1. **P7-001–P7-009:** Charter, rules, planning documents
2. **P7-010–P7-016:** Project shell, config, routing, layout infrastructure
3. **P7-017–P7-019:** Auth pages, profile, settings
4. **P7-020–P7-024:** Dashboard and progress
5. **P7-025–P7-029:** Placement flow
6. **P7-030+:** Curriculum, lessons, practice, assessments, AI Teacher, notifications, billing, reports, support

## Success Criteria

- All planned UI pages render correctly
- All data comes from backend APIs — no local authority
- AIM design system followed consistently
- Arabic/RTL layout works
- No secrets committed
- All authority tests pass
- Responsive across desktop, tablet, and mobile viewports
