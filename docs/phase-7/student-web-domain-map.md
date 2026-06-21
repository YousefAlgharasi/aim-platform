# Phase 7 — Student Web Domain Map

**Phase:** 7 (Deferred)
**Date:** 2026-06-21

## Purpose

Map all Student Web App feature boundaries, user flows, entities, and backend API dependencies to guide implementation.

## Domain Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Student Web App                       │
│                  (Browser Client)                       │
├──────────┬──────────┬──────────┬──────────┬────────────┤
│   Auth   │Dashboard │ Learning │   AI     │  Account   │
│          │& Progress│          │ Teacher  │            │
├──────────┼──────────┼──────────┼──────────┼────────────┤
│ Login    │ Home     │ Placement│ Chat     │ Profile    │
│ Register │ Progress │ Curricul.│ History  │ Settings   │
│ Forgot   │ Skills   │ Lessons  │          │ Billing    │
│ Session  │ Widgets  │ Practice │          │ Notifs     │
│          │          │ Assess.  │          │ Reports    │
│          │          │          │          │ Support    │
└──────────┴──────────┴──────────┴──────────┴────────────┘
         │               │              │
         ▼               ▼              ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (REST)                         │
│  /api/auth  /api/progress  /api/placement  /api/ai     │
│  /api/curriculum  /api/lessons  /api/assessments        │
│  /api/billing  /api/notifications  /api/reports         │
│  /api/support  /api/profile  /api/students              │
└─────────────────────────────────────────────────────────┘
```

## Feature Domains

### 1. Authentication

| Feature | Entities | Backend Dependency |
|---------|----------|-------------------|
| Login | User, Session | `POST /api/auth/login` |
| Register | User | `POST /api/auth/register` |
| Forgot Password | User | `POST /api/auth/forgot-password` |
| Session Refresh | Session | `POST /api/auth/refresh` |
| Logout | Session | `POST /api/auth/logout` |

**Flow:** Login → validate credentials via backend → receive token → store in browser → redirect to dashboard.

### 2. Dashboard & Progress

| Feature | Entities | Backend Dependency |
|---------|----------|-------------------|
| Dashboard Home | Progress, Recommendations, Deadlines | `GET /api/students/me/dashboard` |
| Progress Summary | Mastery, Skills, Streak | `GET /api/students/me/progress` |
| Skill State | Skills, Weaknesses | `GET /api/students/me/skills` |
| Recommendations | Recommendations | `GET /api/students/me/recommendations` |
| Activity Feed | Activities | `GET /api/students/me/activity` |

**Flow:** Load dashboard → fetch progress/recommendations from backend → display read-only summaries → navigate to recommended lessons.

### 3. Placement

| Feature | Entities | Backend Dependency |
|---------|----------|-------------------|
| Placement Entry | PlacementSession | `POST /api/placement/start` |
| Question Display | PlacementQuestion | `GET /api/placement/{id}/next` |
| Answer Submission | PlacementAnswer | `POST /api/placement/{id}/answer` |
| Result Display | PlacementResult | `GET /api/placement/{id}/result` |

**Flow:** Start placement → receive questions one at a time from backend → submit answers → backend scores → display result.

### 4. Curriculum & Lessons

| Feature | Entities | Backend Dependency |
|---------|----------|-------------------|
| Subject Browser | Subjects, Units | `GET /api/curriculum/subjects` |
| Unit Listing | Units, Lessons | `GET /api/curriculum/subjects/{id}/units` |
| Lesson Detail | Lesson, Content | `GET /api/lessons/{id}` |
| Lesson Viewer | LessonContent | `GET /api/lessons/{id}/content` |
| Lesson Completion | LessonProgress | `POST /api/lessons/{id}/complete` |

**Flow:** Browse subjects → select unit → view lesson → consume content → mark complete via backend.

### 5. Practice

| Feature | Entities | Backend Dependency |
|---------|----------|-------------------|
| Practice Start | PracticeSession | `POST /api/practice/start` |
| Question Display | PracticeQuestion | `GET /api/practice/{id}/next` |
| Answer Submission | PracticeAnswer | `POST /api/practice/{id}/answer` |
| Session Summary | PracticeResult | `GET /api/practice/{id}/summary` |

**Flow:** Start practice session → receive questions from backend → submit answers → backend evaluates → display summary.

### 6. Assessments

| Feature | Entities | Backend Dependency |
|---------|----------|-------------------|
| Assessment Entry | Assessment | `GET /api/assessments/available` |
| Assessment Start | AssessmentSession | `POST /api/assessments/{id}/start` |
| Question Display | AssessmentQuestion | `GET /api/assessments/{id}/next` |
| Answer Submission | AssessmentAnswer | `POST /api/assessments/{id}/answer` |
| Result Display | AssessmentResult | `GET /api/assessments/{id}/result` |

**Flow:** View available assessments → start → answer questions → submit → backend scores → display result.

### 7. AI Teacher

| Feature | Entities | Backend Dependency |
|---------|----------|-------------------|
| Chat Interface | Conversation, Message | `POST /api/ai-teacher/message` |
| Conversation History | Conversations | `GET /api/ai-teacher/conversations` |
| Session Management | ConversationSession | `POST /api/ai-teacher/conversations` |

**Flow:** Open chat → send message → backend processes via AI → receive response → display in chat thread.

### 8. Notifications

| Feature | Entities | Backend Dependency |
|---------|----------|-------------------|
| Notification List | Notifications | `GET /api/notifications` |
| Mark Read | Notification | `PATCH /api/notifications/{id}/read` |
| Preferences | NotificationPreferences | `GET/PUT /api/notifications/preferences` |

### 9. Billing

| Feature | Entities | Backend Dependency |
|---------|----------|-------------------|
| Plan Display | Subscription, Plan | `GET /api/billing/subscription` |
| Payment History | Payments | `GET /api/billing/payments` |

### 10. Reports

| Feature | Entities | Backend Dependency |
|---------|----------|-------------------|
| Progress Report | Report | `GET /api/reports/progress` |
| Performance Summary | Report | `GET /api/reports/performance` |

### 11. Support

| Feature | Entities | Backend Dependency |
|---------|----------|-------------------|
| Create Ticket | Ticket | `POST /api/support/tickets` |
| View Tickets | Tickets | `GET /api/support/tickets` |
| Submit Feedback | Feedback | `POST /api/support/feedback` |

### 12. Profile & Settings

| Feature | Entities | Backend Dependency |
|---------|----------|-------------------|
| View Profile | User | `GET /api/profile` |
| Edit Profile | User | `PATCH /api/profile` |
| Settings | Preferences | `GET/PUT /api/settings` |

## Authority Boundary

All entities listed above are **read from** or **submitted to** the backend. The Student Web App never:

- Computes mastery, scores, or pass/fail
- Determines recommendations or review schedules
- Modifies billing state or entitlements
- Delivers notifications
- Accesses the database directly
- Calls AIM Engine directly
