# Phase 7 — Student Web Route Map

**Phase:** 7 (Deferred)
**Date:** 2026-06-21

## Purpose

Map all Student Web App routes for authentication, dashboard, learning, assessments, AI Teacher, notifications, billing, reports, and support.

## Route Structure

### Public Routes (No Auth Required)

| Route | Page | Description |
|-------|------|------------|
| `/login` | Login | Email/password login |
| `/register` | Register | New student registration |
| `/forgot-password` | Forgot Password | Password reset request |
| `/reset-password` | Reset Password | Password reset with token |
| `/session-expired` | Session Expired | Expired session notice |

### Protected Routes (Auth Required)

#### Dashboard

| Route | Page | Description |
|-------|------|------------|
| `/` | Dashboard Home | Overview with progress, recommendations, deadlines |
| `/dashboard` | Dashboard Home | Alias for `/` |
| `/dashboard/widgets` | Dashboard Widgets | Configurable widget view |

#### Progress

| Route | Page | Description |
|-------|------|------------|
| `/progress` | Progress Summary | Overall mastery and completion |
| `/progress/skills` | Skill State | Per-skill mastery, weaknesses, recommendations |

#### Placement

| Route | Page | Description |
|-------|------|------------|
| `/placement` | Placement Entry | Start or resume placement test |
| `/placement/:id` | Placement Session | Active placement question UI |
| `/placement/:id/result` | Placement Result | Backend-computed placement result |

#### Curriculum & Lessons

| Route | Page | Description |
|-------|------|------------|
| `/curriculum` | Subject Browser | List of subjects |
| `/curriculum/:subjectId` | Unit Listing | Units within a subject |
| `/curriculum/:subjectId/:unitId` | Lesson Listing | Lessons within a unit |
| `/lessons/:id` | Lesson Viewer | Lesson content display |

#### Practice

| Route | Page | Description |
|-------|------|------------|
| `/practice` | Practice Start | Begin a practice session |
| `/practice/:id` | Practice Session | Active practice question UI |
| `/practice/:id/summary` | Practice Summary | Session results |

#### Assessments

| Route | Page | Description |
|-------|------|------------|
| `/assessments` | Assessment List | Available assessments |
| `/assessments/:id` | Assessment Session | Active assessment question UI |
| `/assessments/:id/result` | Assessment Result | Backend-computed result |

#### AI Teacher

| Route | Page | Description |
|-------|------|------------|
| `/ai-teacher` | AI Teacher | Chat interface |
| `/ai-teacher/:conversationId` | Conversation | Specific conversation thread |

#### Notifications

| Route | Page | Description |
|-------|------|------------|
| `/notifications` | Notification List | All notifications |
| `/notifications/preferences` | Notification Preferences | Manage notification settings |

#### Billing

| Route | Page | Description |
|-------|------|------------|
| `/billing` | Billing Overview | Subscription status and plan |
| `/billing/history` | Payment History | Past payments |

#### Reports

| Route | Page | Description |
|-------|------|------------|
| `/reports` | Reports Home | Available reports |
| `/reports/progress` | Progress Report | Detailed progress report |
| `/reports/performance` | Performance Summary | Performance overview |

#### Support

| Route | Page | Description |
|-------|------|------------|
| `/support` | Support Home | Create ticket or submit feedback |
| `/support/tickets` | Ticket List | View own tickets |
| `/support/tickets/:id` | Ticket Detail | View ticket and add comments |

#### Account

| Route | Page | Description |
|-------|------|------------|
| `/profile` | Profile | View and edit profile |
| `/settings` | Settings | Locale, preferences, account actions |

### Error Routes

| Route | Page | Description |
|-------|------|------------|
| `/403` | Forbidden | Access denied |
| `/404` | Not Found | Page not found |
| `/*` | Not Found | Catch-all redirect to 404 |

## Route Groups & Layouts

```
PublicLayout (no sidebar, centered)
├── /login
├── /register
├── /forgot-password
├── /reset-password
└── /session-expired

AppLayout (sidebar + topbar, authenticated)
├── DashboardLayout
│   ├── /
│   ├── /dashboard
│   └── /dashboard/widgets
├── ProgressLayout
│   ├── /progress
│   └── /progress/skills
├── PlacementLayout
│   ├── /placement
│   ├── /placement/:id
│   └── /placement/:id/result
├── CurriculumLayout
│   ├── /curriculum
│   ├── /curriculum/:subjectId
│   ├── /curriculum/:subjectId/:unitId
│   └── /lessons/:id
├── PracticeLayout
│   ├── /practice
│   ├── /practice/:id
│   └── /practice/:id/summary
├── AssessmentLayout
│   ├── /assessments
│   ├── /assessments/:id
│   └── /assessments/:id/result
├── AITeacherLayout
│   ├── /ai-teacher
│   └── /ai-teacher/:conversationId
├── /notifications
├── /notifications/preferences
├── /billing
├── /billing/history
├── /reports
├── /reports/progress
├── /reports/performance
├── /support
├── /support/tickets
├── /support/tickets/:id
├── /profile
└── /settings

ErrorLayout
├── /403
└── /404
```

## Guard Rules

- **AuthGuard:** All routes under `AppLayout` require valid auth token. Redirect to `/login` if missing or expired.
- **PlacementGuard:** `/placement/:id` routes verify active placement session via backend.
- **AssessmentGuard:** `/assessments/:id` routes verify active assessment session via backend.
- All guards check backend state — no local session validation beyond token presence.
