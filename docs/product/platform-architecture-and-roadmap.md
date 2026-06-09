# AIM Platform — Full Architecture and Implementation Roadmap

## Overview

The correct approach after completing the AIM Algorithm is not to jump directly into building interfaces. Instead, the system should be built as a complete adaptive learning platform around the AIM Algorithm — with the algorithm as the core of the system and the AI Teacher as an intelligent teaching layer on top of it.

---

## 1. System Vision

AIM will be an adaptive English learning platform consisting of:

1. **Mobile App** — for students, and optionally for parents.
2. **Web App** — for students who prefer studying from a browser.
3. **Admin Dashboard** — for administration, content management, student management, teacher management, analytics, assessments, and human review.
4. **Backend API** — manages users, lessons, sessions, assessments, results, subscriptions, permissions, notifications, and integration with the AIM Engine.
5. **AIM Engine** — a Python service containing the completed algorithm: performance analysis, mastery calculation, weakness detection, difficulty adaptation, recommendations, spaced repetition, and student learning state analysis.
6. **AI Teacher Gateway** — a layer responsible for communicating with an AI API or external/internal model. The client application must never connect directly to the AI provider.

---

## 2. Proposed Final Architecture

```
Mobile App / Web App / Admin Dashboard
        |
        v
Backend API Gateway
        |
        |---- Auth & Users
        |---- Courses & Lessons
        |---- Sessions & Attempts
        |---- Assessments & Exams
        |---- Analytics
        |---- Notifications
        |---- Payments
        |---- Admin & Roles
        |---- AI Teacher Gateway
        |
        v
AIM Engine — Python Service
        |
        |---- PerformanceAnalyzer
        |---- MasteryCalculator
        |---- WeaknessDetector
        |---- DifficultyAdapter
        |---- RecommendationEngine
        |---- RetentionTracker
        |---- EmotionalStateDetector
        |
        v
Database / Storage / Logs / Vector DB
```

**Summary:** One feature-based backend + AIM Engine as an independent Python service + AI Gateway as an independent module inside the backend.

The client application must never connect directly to OpenAI or any AI provider. Direct connections create security, cost, control, and student data retention problems.

---

## 3. Proposed Technology Stack

### Mobile App

- Flutter
- Riverpod StateNotifier
- Feature-first architecture
- Dio
- Local cache
- Push notifications
- Voice recording/playback

**Folder structure:**

```
lib/
  core/
    config/
    network/
    routing/
    theme/
    errors/
    utils/

  features/
    auth/
      data/
        datasources/
        repository/repo_impl/
        models/
      logic/
        entity/
        repository/
        provider/
      ui/
        pages/
        widgets/

    placement_test/
    learning_path/
    lessons/
    ai_tutor/
    assessments/
    progress/
    notifications/
    profile/
    parent_view/
```

---

### Web App

**Recommended option (commercially stronger):**

- Next.js / React
- TypeScript
- Tailwind
- React Query
- Zustand or Redux Toolkit

**Reason:** The web app and dashboard typically require tables, controls, SEO for public pages, marketing pages, content management, and analytics dashboards. Next.js is well-suited for all of this.

**Alternative:** Flutter Web — not recommended for the Admin Dashboard unless the goal is to unify the team's stack. For a serious dashboard, Next.js is the better choice.

---

### Admin Dashboard

A separate web application under `apps/admin`, containing:

- Dashboard Overview
- Students Management
- Parents Management
- Teachers / Human Reviewers
- Courses Management
- Chapters Management
- Lessons Management
- Question Bank
- Placement Test Builder
- Quizzes & Exams
- AI Sessions Monitor
- AIM Algorithm Monitor
- Student Progress Analytics
- Weakness Reports
- Content Review
- Subscriptions & Payments
- Notifications Center
- Roles & Permissions
- Audit Logs
- System Settings

---

### Backend

- NestJS or Express TypeScript
- PostgreSQL / Supabase
- Redis
- BullMQ for queues
- JWT / Firebase Auth (to be decided)
- Prisma ORM or TypeORM

**Recommended stack:** NestJS + PostgreSQL + Redis + Python AIM Engine

AIM has many relational concerns: students, lessons, attempts, scores, assessments, sessions, recommendations, parents, subscriptions, and reports. PostgreSQL is stronger than Firestore for this use case.

If the existing Firebase/NoSQL decision is retained: Firebase Auth + Firestore + Cloud Functions + BigQuery for analytics later.

**Engineering opinion:** Firebase Auth is acceptable, but the primary database should be PostgreSQL/Supabase.

---

### AIM Engine

The algorithm must not live as a code module inside the backend. It runs as an independent service:

```
aim-engine/
  app/
    main.py
    api/
      session_routes.py
      analysis_routes.py
      recommendation_routes.py

    services/
      skill_graph.py
      performance_analyzer.py
      mastery_calculator.py
      weakness_detector.py
      error_pattern_classifier.py
      difficulty_adapter.py
      recommendation_engine.py
      retention_tracker.py
      emotional_state_detector.py

    schemas/
    tests/
```

The backend sends session data; the engine returns a decision:

```json
{
  "mastery": 0.76,
  "confidence": 0.68,
  "weaknesses": ["past_simple", "listening_speed"],
  "next_difficulty": "B1-medium",
  "recommended_lessons": ["lesson_42", "lesson_47"],
  "review_schedule": "2026-06-10",
  "frustration_score": 0.31
}
```

---

## 4. AI Teacher — API or Custom Model?

**Recommendation:** Start with an AI API. Do not attempt to train a custom model at this stage.

**Reason:** The project first needs a strong learning experience, real student data, well-designed prompts, assessments, and a recommendation system. After that, the decision on fine-tuning or a custom model can be made with evidence.

---

### AI Teacher Orchestrator

This is not a chatbot. It is an AI Teacher Orchestrator with the following responsibilities:

1. Understand the student's level.
2. Read the student's state from the AIM Engine.
3. Know the current lesson.
4. Know the student's previous errors.
5. Deliver an appropriate explanation.
6. Ask a question.
7. Receive the student's answer.
8. Correct the answer.
9. Send attempt data to the backend.
10. Call the AIM Engine.
11. Adapt explanation or difficulty based on the result.

---

### Text Teacher

For text-based explanation and conversation, use an API layer built on the Responses API or any LLM provider. The Responses API supports text/image responses, custom tool calls, and tools such as file search — making it suitable for connecting the teacher to AIM content and the educational knowledge base.

### Voice Teacher

For live voice interaction, use the Realtime Voice API or an equivalent. Realtime sessions support low-latency live audio, and a voice-agent session allows the client to send audio or text and receive responses, events, and tool call triggers.

- **WebRTC** — preferred when audio capture and playback happen directly on the device.
- **WebSocket** — preferred when audio is routed through the server or a worker.

### Speech-to-Text

For non-live voice answers, use a Speech-to-Text service. Standard endpoints such as `transcriptions` and `translations` convert audio to text or translate it into English.

---

## 5. Primary Database Schema

### Core Tables

| Domain | Tables |
|---|---|
| Identity | `users`, `roles`, `permissions` |
| Profiles | `student_profiles`, `parent_profiles`, `student_parent_links` |
| Curriculum | `courses`, `levels`, `chapters`, `lessons`, `lesson_assets`, `lesson_objectives`, `skills`, `skill_graph_edges` |
| Placement | `placement_tests`, `placement_questions`, `placement_attempts`, `placement_results` |
| Learning | `learning_paths`, `learning_path_items`, `student_skill_states`, `student_progress` |
| Sessions | `sessions`, `session_events`, `lesson_attempts`, `answers`, `mistakes`, `error_patterns`, `weakness_records` |
| Assessment | `quizzes`, `quiz_questions`, `quiz_attempts`, `quiz_scores`, `exams`, `exam_results` |
| AI | `ai_conversations`, `ai_messages`, `voice_sessions`, `ai_feedback`, `ai_safety_flags` |
| Adaptive | `recommendations`, `review_schedules` |
| Engagement | `notifications`, `achievements`, `badges`, `streaks` |
| Commerce | `subscriptions`, `payments`, `invoices` |
| Operations | `admin_actions`, `audit_logs`, `system_settings` |

**Most critical table: `student_skill_states`** — this is the algorithm's memory of each student.

---

## 6. Full Data Flow

### Student Start

```
Sign up / Login
    ↓
Profile setup
    ↓
Placement test
    ↓
AIM Engine analyzes result
    ↓
Create personalized learning path
    ↓
Student starts first lesson
```

### During a Lesson

```
Student opens lesson
    ↓
Backend loads lesson + student skill state
    ↓
AI Teacher explains
    ↓
Student answers question
    ↓
Backend saves attempt
    ↓
AIM Engine analyzes attempt
    ↓
Update mastery / weakness / difficulty
    ↓
AI Teacher adapts explanation
    ↓
Next question or next lesson
```

### End of Session

```
Session completed
    ↓
Generate session summary
    ↓
Update progress dashboard
    ↓
Schedule review
    ↓
Send recommendations
    ↓
Parent/Admin analytics updated
```

---

## 7. Full Implementation Plan

### Phase 0 — Product Definition

Before any code:

- Define roles
- Define student journey
- Define parent journey
- Define admin journey
- Define course structure
- Define English skill tree
- Define placement test rules
- Define lesson format
- Define AI teacher behavior
- Define MVP scope

**Outputs:** SRS, feature list, user stories, database draft, API draft, UI sitemap, AI behavior document.

---

### Phase 1 — System Foundation

Build the technical foundation:

- Monorepo setup
- Backend skeleton
- AIM Engine service skeleton
- Mobile app skeleton
- Web app skeleton
- Admin dashboard skeleton
- Shared API contracts
- Environment configs
- Docker Compose
- CI/CD
- Linting and testing setup

**Proposed monorepo structure:**

```
aim-platform/
  apps/
    mobile/
    web/
    admin/

  services/
    backend-api/
    aim-engine/
    ai-gateway/

  packages/
    shared-types/
    api-contracts/
    ui-kit/

  infra/
    docker/
    nginx/
    deployment/

  docs/
```

---

### Phase 2 — Auth, Users, Roles

- Student registration
- Parent registration
- Admin login
- Role-based access control
- JWT / Firebase Auth integration
- Profile management
- Student-parent relation
- Account status

**Roles:** Student, Parent, Admin, Content Manager, Human Reviewer, Super Admin.

---

### Phase 3 — Curriculum and Content System

- Courses, Levels, Chapters, Lessons
- Skills and objectives
- Lesson assets
- Question bank
- Content status: draft / published / archived

**Critical requirement:** Every lesson must be linked to one or more skills. Without this link, the AIM Engine cannot determine what to develop in the student.

```
Lesson: Past Simple Basics
Skills:
  grammar.past_simple.forms
  grammar.past_simple.negative
  grammar.past_simple.questions
```

---

### Phase 4 — Placement Test

- Adaptive placement test
- Grammar, vocabulary, reading, listening questions
- Speaking and writing: optional in later phases

**Output:**
- Estimated level: A1 / A2 / B1
- Skill mastery map
- Weakness map
- Initial learning path

---

### Phase 5 — AIM Engine Integration

The backend sends:

```json
{
  "student_id": "...",
  "session_id": "...",
  "lesson_id": "...",
  "skill_id": "...",
  "question_id": "...",
  "answer": "...",
  "is_correct": true,
  "time_spent": 12.4,
  "retry_count": 1,
  "hint_used": false,
  "difficulty": "A1-medium",
  "confidence_signal": 0.72
}
```

The AIM Engine returns:

```json
{
  "mastery": 0.76,
  "weakness_update": [...],
  "difficulty_decision": "A1-hard",
  "next_recommendation": "lesson_42",
  "review_schedule": "2026-06-10",
  "frustration_score": 0.31,
  "session_summary": {...}
}
```

This phase is more important than the interfaces — it is what makes AIM genuinely adaptive.

---

### Phase 6 — Student Mobile App MVP

**Core screens:**
Splash, Onboarding, Login/Register, Placement Test, Home, My Learning Path, Lesson Page, AI Teacher Chat, Question/Answer Screen, Progress Screen, Achievements, Profile, Notifications.

**First version minimum requirements:** login, placement, lesson, answer questions, AI teacher text, progress, recommendations.

---

### Phase 7 — Student Web App

- Landing page
- Login
- Student dashboard
- Placement test
- Learning path
- Lesson player
- AI teacher chat
- Progress
- Account settings

Important for students who study on a laptop and for later marketing.

---

### Phase 8 — AI Teacher Text Mode

**Responsibilities:**
- Explain lesson
- Ask questions
- Correct answers
- Give examples
- Simplify explanation
- Change teaching style
- Use Arabic support when needed
- Adapt to student level
- Send structured attempt result to backend

**Structured response format:**

```json
{
  "teacher_message": "Good try. The correct sentence is...",
  "detected_error": "past_simple_negative",
  "skill_id": "grammar.past_simple.negative",
  "is_answer_correct": false,
  "feedback_type": "correction",
  "next_action": "give_similar_question"
}
```

---

### Phase 9 — AI Teacher Voice Mode

After Text Mode is proven:

- Voice conversation
- Speech-to-text
- Text-to-speech
- Realtime conversation
- Voice session logs
- Pronunciation feedback
- Speaking practice
- Listening practice

Launch as a Beta feature — cost, security, and quality require careful monitoring.

---

### Phase 10 — Quizzes, Exams, Deadlines

- Lesson quizzes
- Chapter quizzes
- Level exams
- Timed exams
- Attempts and scores
- Manual review requests
- AI grading suggestions
- Human reviewer final decision

**Rule:** AI must not be the final judge for writing and speaking assessments. It provides a suggestion; high-stakes or disputed cases go to a human reviewer.

---

### Phase 11 — Admin Dashboard

**Key sections:** Overview, Students, Parents, Courses, Lessons, Questions, Placement Tests, Sessions, AI Conversations, Weakness Analytics, Progress Analytics, Reports, Subscriptions, Notifications, System Logs, Settings.

**Most important views:**
- Student profile report
- Skill mastery heatmap
- Weakness distribution
- AI usage cost
- Lesson completion rate
- Drop-off points
- Placement accuracy

---

### Phase 12 — Parent Dashboard

- Child progress
- Weekly report
- Weakness summary
- Time studied
- Completed lessons
- Upcoming reviews
- Alerts, badges, recommended support actions

**Design principle:** Keep it simple. Parents need to see: the child's level, whether they are improving, where they are weak, and what is required this week.

---

### Phase 13 — Notifications and Engagement

- Daily reminder
- Review reminder
- Quiz deadline reminder
- Streak reminders
- Parent weekly report
- Achievement notification
- Inactive student notification

Avoid notification overload.

---

### Phase 14 — Payments and Subscriptions

- Free trial, monthly, yearly, family, school/institute plans
- Coupons, invoices, payment status, plan limits

**Plan boundaries:**

| Plan | Access |
|---|---|
| Free | Limited lessons, limited AI messages |
| Premium | Full lessons, AI teacher, voice sessions, reports |
| Institute | Multiple students, admin seats, advanced analytics |

---

### Phase 15 — Analytics and Reporting

- Student analytics
- Learning analytics
- Content analytics
- AI analytics
- Business analytics

**Example metrics:** average mastery improvement, most difficult skills, most failed lessons, AI correction accuracy, voice session duration, cost per student, retention rate, subscription conversion.

---

### Phase 16 — Safety, Privacy, and Guardrails

Required because the system is educational and may serve young students:

- Age handling and parent consent
- Content moderation
- AI response filtering
- No medical or clinical diagnosis
- No unsafe advice
- Conversation logging
- PII protection
- Rate limits
- Abuse detection
- Human escalation

All learner behavioral analysis must remain **educational and behavioral** — never clinical or medical diagnosis.

---

### Phase 17 — Testing and QA

- Unit tests, integration tests, API tests
- AIM Engine tests
- AI prompt tests
- Mobile widget tests
- Admin dashboard tests
- Security tests, load tests, voice latency tests

**AI Teacher evaluations required:**
- Does it explain correctly?
- Does it adapt to the student's level?
- Does it avoid hallucination?
- Does it follow the curriculum?
- Does it return structured output?
- Does it detect mistakes correctly?

---

### Phase 18 — Deployment

| Component | Platform |
|---|---|
| Backend API | Railway / Render / AWS / GCP |
| AIM Engine | Docker service |
| Database | Supabase PostgreSQL |
| Cache / Queue | Upstash Redis |
| Storage | S3-compatible |
| Web / Admin | Vercel |
| Mobile | Google Play → App Store |
| Monitoring | Sentry + logs |

**Environments:** local → development → staging → production. Never deploy directly to production without staging.

---

## 8. Correct Build Order

Do not start with: Mobile + Web + Admin + Voice + AI all at once.

| Step | Component |
|---|---|
| 1 | Backend foundation |
| 2 | Database schema |
| 3 | Auth and users |
| 4 | Curriculum system |
| 5 | Placement test |
| 6 | AIM Engine integration |
| 7 | Student mobile MVP |
| 8 | AI Teacher text |
| 9 | Progress dashboard |
| 10 | Admin content dashboard |
| 11 | Quizzes and exams |
| 12 | Parent dashboard |
| 13 | AI Teacher voice |
| 14 | Payments |
| 15 | Advanced analytics |
| 16 | Production hardening |

---

## 9. MVP Scope

**First commercial version must include only:**

- Student mobile app
- Student web app (basic)
- Admin dashboard (basic)
- Auth
- Placement test
- Learning path
- Lessons
- Questions
- AIM Engine integration
- AI Teacher text
- Progress tracking
- Basic reports
- Basic notifications

**Exclude from first MVP:**

- Full voice AI
- Complex payments
- Multi-school/institute support
- Full human reviewer workflow
- Advanced analytics
- Marketplace

These come after the core learning experience is proven.

---

## 10. Critical Items Not Yet Explicitly Documented

| # | Item |
|---|---|
| 1 | Content Management System |
| 2 | English Skill Tree |
| 3 | Question Bank |
| 4 | AI Prompt Management |
| 5 | AI Cost Control |
| 6 | AI Safety Guardrails |
| 7 | Human Review Workflow |
| 8 | Student Event Tracking |
| 9 | Parent Consent |
| 10 | Multi-language Support (Arabic / English) |
| 11 | Subscription Plans |
| 12 | Admin Audit Logs |
| 13 | Backup Strategy |
| 14 | Monitoring and Error Tracking |
| 15 | API Rate Limiting |
| 16 | Data Privacy Policy |
| 17 | Terms of Use |
| 18 | Teacher / Reviewer Role |
| 19 | Analytics Warehouse (later) |
| 20 | Support / Tickets System |

---

## 11. Final Decision

| Component | Decision |
|---|---|
| Mobile | Flutter + Riverpod StateNotifier + feature-first |
| Web | Next.js |
| Admin | Next.js dashboard |
| Backend | NestJS TypeScript, feature-based |
| AIM Engine | Python FastAPI, independent service |
| Database | PostgreSQL / Supabase |
| Cache / Queue | Redis + BullMQ |
| AI | AI Gateway inside backend; OpenAI/LLM provider swappable; text first, voice later |
| Storage | S3-compatible |
| Deployment | Docker + staging + production |

---

## Core Principle

**The AIM Algorithm is the real product.**

The AI Teacher is not just a chat interface — it is a teaching interface that uses the algorithm's decisions. Every question, answer, error, response time, attempt, hesitation, and repetition must be converted into data that enters the AIM Engine, then returned as a clear educational decision.
