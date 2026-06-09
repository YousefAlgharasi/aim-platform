# AIM Platform — Full System Architecture and Roadmap

## Overview

Based on the current state of the AIM project and the completed AIM Algorithm, the best path forward is not to jump directly into building interfaces. Instead, the right approach is to build the system as a complete adaptive learning platform centered on the AIM Algorithm — where the algorithm is the heart of the system, and the AI Teacher is simply an intelligent teaching layer sitting on top of it.

---

## 1. The Final System Idea

AIM will be an adaptive English learning platform composed of:

1. **Mobile App** — Flutter Mobile, the approved Phase 1 learner client for students, and optionally for parents.
2. **Admin Dashboard** — for management, content, students, teachers, analytics, assessments, and human review.
3. **Backend API** — NestJS + TypeScript. Manages users, lessons, sessions, assessments, results, subscriptions, permissions, notifications, and integration with the AIM Engine.
4. **AIM Engine** — a Python backend service containing the completed algorithm: performance analysis, mastery calculation, weakness detection, difficulty adaptation, recommendations, spaced repetition, and educational state analysis.
5. **AI Teacher Gateway** — a backend-only layer responsible for communicating with an AI API or external/internal model. The client app must never connect directly to an AI provider.

> **Note:** A Student Web App is deferred and optional. It is not part of Phase 1 System Foundation. See `docs/phase-1/system-foundation-charter.md` Section 3.

---

## 2. Proposed Final Architecture

The best structure for the AIM project:

```
Flutter Mobile App / Admin Dashboard
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

**Summary:**
One core feature-based Backend + AIM Engine as a standalone Python service + AI Gateway as a standalone module inside the backend.

> Clients must never connect directly to OpenAI or any AI provider. Direct client-to-AI connections cause serious problems in security, cost, control, and student data protection.

---

## 3. Proposed Technology for Each Component

### Mobile App

**Use:**

- Flutter
- Riverpod StateNotifier
- Feature-first architecture
- Dio (HTTP client)
- Local cache
- Push notifications
- Voice recording and playback

**Suggested structure:**

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

### Admin Dashboard

Best as a separate web application:

```
apps/admin
```

**Contains:**

- Dashboard Overview
- Students Management
- Parents Management
- Teachers / Human Reviewers
- Courses Management
- Chapters Management
- Lessons Management
- Questions Bank
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

**Use:**

- NestJS + TypeScript
- PostgreSQL / Supabase
- Redis
- BullMQ for queues
- Supabase Auth (locked default — see `docs/product/non-negotiables.md`)
- Prisma ORM or TypeORM

**Recommended stack:**

> **NestJS + PostgreSQL + Redis + Python AIM Engine**

AIM has many relationships: students, lessons, attempts, grades, assessments, sessions, recommendations, parents, subscriptions, and reports. PostgreSQL is far stronger than Firestore for this type of relational data.

---

### AIM Engine

The completed algorithm should not just be code buried inside the backend. It should be a standalone Python backend service, called only by the Backend API — never by clients directly.

> The AIM Engine is a Python backend service/module. Its internal web framework (e.g. FastAPI for its own API routes) is separate from the Phase 1 Backend API, which is NestJS + TypeScript. Clients never call the AIM Engine. Only the NestJS Backend API calls it backend-internally.

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

The Backend sends session data to the AIM Engine. The AIM Engine returns the decision:

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

## 4. AI Teacher — External API or Custom Model?

**Recommendation:** Start with an AI API. Do not start by training a custom model from scratch.

**Why?**
The project first needs a strong learning experience, real student data, well-crafted prompts, assessments, and a recommendation system. After that, we can decide whether fine-tuning or a custom model is needed.

### Correct AI Teacher Design

Do not call it just a Chatbot. It must be an:

**AI Teacher Orchestrator**

Its responsibilities:

1. Understand the student's level.
2. Read the student's state from the AIM Engine.
3. Know the current lesson.
4. Know previous mistakes.
5. Deliver an appropriate explanation.
6. Ask a question.
7. Receive the student's answer.
8. Correct the answer.
9. Send attempt data to the backend.
10. Call the AIM Engine.
11. Adjust the explanation or difficulty based on the result.

### Text Teacher

For text-based explanation and conversation, use an API layer built on the Responses API or any LLM provider. The Responses API supports generating responses from text/images, can invoke custom tools, and supports tools such as file search — making it well-suited for connecting the teacher to AIM content and the educational knowledge base.

### Voice Teacher

For live voice interaction, use a Realtime Voice API or a similar alternative. Realtime sessions are designed for low-latency live audio, and a voice-agent session allows the client to send audio or text and receive responses, events, and tool call invocations.

For web and mobile:
- **WebRTC** is best when capturing and playing audio directly from the device.
- **WebSocket** is better when audio passes through a server or worker.

### Speech-to-Text

For indirect voice answers, use a Speech-to-Text service. Endpoints such as transcriptions and translations convert audio to text or translate it to English.

---

## 5. Primary Database Schema

These are the most important tables or collections:

```
users
roles
permissions
student_profiles
parent_profiles
student_parent_links

courses
levels
chapters
lessons
lesson_assets
lesson_objectives
skills
skill_graph_edges

placement_tests
placement_questions
placement_attempts
placement_results

learning_paths
learning_path_items
student_skill_states
student_progress

sessions
session_events
lesson_attempts
answers
mistakes
error_patterns
weakness_records

quizzes
quiz_questions
quiz_attempts
quiz_scores
exams
exam_results

ai_conversations
ai_messages
voice_sessions
ai_feedback
ai_safety_flags

recommendations
review_schedules
notifications
achievements
badges
streaks

subscriptions
payments
invoices

admin_actions
audit_logs
system_settings
```

**Most important table:**

> `student_skill_states`
>
> This table represents the algorithm's memory about the student. Everything the AIM Engine knows about a student's progress lives here.

---

## 6. Complete Data Flow

### Student Start Flow

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

## 7. Complete Execution Plan

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
- Define AI Teacher behavior
- Define MVP scope

**Deliverables:**

- SRS (Software Requirements Specification)
- Feature list
- User stories
- Database draft
- API draft
- UI sitemap
- AI behavior document

---

### Phase 1 — System Foundation

Build the technical foundation:

- Monorepo setup
- Backend skeleton (NestJS + TypeScript)
- AIM Engine service skeleton (Python)
- Mobile app skeleton (Flutter)
- Admin dashboard skeleton
- Shared API contracts
- Environment configs
- Docker Compose
- CI/CD
- Linting and testing setup

> **Phase 1 does not include Student Web App implementation.** The Student Web App is Deferred / Optional / Phase 7 or later. No React or Next.js learner web app work is permitted in Phase 1. See Phase 7 below and `docs/phase-1/system-foundation-charter.md`.

**Suggested repository structure:**

```
aim-platform/
  apps/
    mobile/          ← Flutter Mobile (Phase 1 learner client)
    admin/           ← Admin Dashboard
    # NOTE: apps/web/ is the existing completed React Web MVP pilot.
    # A future Student Web App (if approved) must NOT reuse this folder.

  services/
    backend-api/     ← NestJS + TypeScript (Phase 1 Backend API)
    aim-engine/      ← Python AIM Engine service
    ai-gateway/      ← AI Teacher Gateway (backend-only)

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

Build:

- Student registration
- Parent registration
- Admin login
- Role-based access control
- Supabase Auth integration (JWT validation on the backend)
- Profile management
- Student-parent relationship
- Account status management

**Roles:**

- Student
- Parent
- Admin
- Content Manager
- Human Reviewer
- Super Admin

---

### Phase 3 — Curriculum & Content System

Build the content system:

- Courses
- Levels
- Chapters
- Lessons
- Skills
- Objectives
- Lesson assets
- Question bank
- Content status: draft / published / archived

**Critical requirement:**
Every lesson must be linked to one or more skills.

**Example:**

```
Lesson: Past Simple Basics
Skills:
  grammar.past_simple.forms
  grammar.past_simple.negative
  grammar.past_simple.questions
```

Without this linking, the AIM Engine will not know what to develop in the student.

---

### Phase 4 — Placement Test

Build the level-assessment test:

- Adaptive placement test
- Grammar questions
- Vocabulary questions
- Reading questions
- Listening questions
- Speaking (optional, later)
- Writing (optional, later)

**Output:**

- Estimated level: A1 / A2 / B1
- Skill mastery map
- Weakness map
- Initial learning path

---

### Phase 5 — AIM Engine Integration

This is where the algorithm is actually wired in.

**The Backend sends:**

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

**The AIM Engine returns:**

```json
{
  "mastery_update": 0.76,
  "weakness_update": ["past_simple_negative"],
  "difficulty_decision": "A1-hard",
  "next_recommendation": "lesson_42",
  "review_schedule": "2026-06-10",
  "frustration_score": 0.31,
  "session_summary": "..."
}
```

> This phase is more important than any interface, because it is what makes AIM genuinely "adaptive."

---

### Phase 6 — Student Mobile App MVP

**Core screens:**

- Splash
- Onboarding
- Login / Register
- Placement Test
- Home
- My Learning Path
- Lesson Page
- AI Teacher Chat
- Question / Answer Screen
- Progress Screen
- Achievements
- Profile
- Notifications

The first version does not need everything. The essentials are:

- Login
- Placement
- Lesson
- Answer questions
- AI Teacher text
- Progress
- Recommendations

---

### Phase 7 — Student Web App (Deferred / Optional)

> **This phase is deferred and optional.** A Student Web App is not part of Phase 1 System Foundation. It requires an explicit documented product decision before any work begins. See `docs/phase-1/system-foundation-charter.md` Section 3 and `docs/product/open-decisions.md` OD-002.
>
> When approved, it should be built as a separate app (e.g. `apps/student-web/`) using Next.js, and must never reuse `apps/web/` which is the completed React MVP pilot directory.

---

### Phase 8 — AI Teacher Text Mode

Build the text-based teacher:

**Responsibilities:**

- Explain lessons
- Ask questions
- Correct answers
- Give examples
- Simplify explanations
- Change teaching style
- Use Arabic support when needed
- Adapt to student level
- Send structured attempt result to the backend

**Backend response must be structured:**

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

After Text Mode succeeds:

- Voice conversation
- Speech-to-text
- Text-to-speech
- Realtime conversation
- Voice session logs
- Pronunciation feedback
- Speaking practice
- Listening practice

> Launch voice as a Beta feature. Cost, security, and quality all require monitoring before full rollout.

---

### Phase 10 — Quizzes, Exams, and Deadlines

Build:

- Lesson quizzes
- Chapter quizzes
- Level exams
- Timed exams
- Attempts
- Scores
- Manual review requests
- AI grading suggestions
- Human reviewer final decision

**Important:**
Do not make AI the final judge for writing or speaking assessments. Let it provide a suggestion, and if there is a dispute or the grade is high-stakes, route it to a human reviewer.

---

### Phase 11 — Admin Dashboard

**Core sections:**

- Overview
- Students
- Parents
- Courses
- Lessons
- Questions
- Placement Tests
- Sessions
- AI Conversations
- Weakness Analytics
- Progress Analytics
- Reports
- Subscriptions
- Notifications
- System Logs
- Settings

**Most important dashboard pages:**

- Student profile report
- Skill mastery heatmap
- Weakness distribution
- AI usage cost
- Lesson completion rate
- Drop-off points
- Placement accuracy

---

### Phase 12 — Parent Dashboard

**For parents:**

- Child progress
- Weekly report
- Weakness summary
- Time studied
- Completed lessons
- Upcoming reviews
- Alerts
- Badges
- Recommended support actions

> Do not give parents overly complex details. Let them see: the child's level, whether they are improving, where their weaknesses are, and what is required this week.

---

### Phase 13 — Notifications & Engagement

Build:

- Daily reminder
- Review reminder
- Quiz deadline reminder
- Streak reminders
- Parent weekly report
- Achievement notification
- Inactive student notification

> Design notifications carefully to avoid being intrusive.

---

### Phase 14 — Payments & Subscriptions

Based on the business model:

- Free trial
- Monthly subscription
- Yearly subscription
- Family plan
- School / institute plan
- Coupons
- Invoices
- Payment status
- Plan limits

**Subscription linked to permissions:**

```
Free:
  - Limited lessons
  - Limited AI messages

Premium:
  - Full lessons
  - AI Teacher (text)
  - Voice sessions
  - Reports

Institute:
  - Multiple students
  - Admin seats
  - Advanced analytics
```

---

### Phase 15 — Analytics & Reporting

Analytics are not a luxury — AIM requires strong analytics.

**Build:**

- Student analytics
- Learning analytics
- Content analytics
- AI analytics
- Business analytics

**Examples:**

- Average mastery improvement
- Most difficult skills
- Most failed lessons
- AI correction accuracy
- Voice session duration
- Cost per student
- Retention rate
- Subscription conversion

---

### Phase 16 — Safety, Privacy, and Guardrails

This is critical because the system is educational and may be used by young learners.

**Required:**

- Age handling
- Parent consent
- Content moderation
- AI response filtering
- No medical or clinical diagnosis
- No unsafe advice
- Conversation logging
- PII protection
- Rate limits
- Abuse detection
- Human escalation path

> For educational behavioral analysis: always keep it educational and behavioral, never medical diagnosis.

---

### Phase 17 — Testing & QA

**Required tests:**

- Unit tests
- Integration tests
- API tests
- AIM Engine tests
- AI prompt tests
- Mobile widget tests
- Admin dashboard tests
- Security tests
- Load tests
- Voice latency tests

**AI Teacher Evals are critical:**

- Does it explain correctly?
- Does it adapt to level?
- Does it avoid hallucination?
- Does it follow the curriculum?
- Does it return structured output?
- Does it detect mistakes correctly?

---

### Phase 18 — Deployment

**Proposed environment:**

| Component | Suggested Platform |
|---|---|
| Backend API | Railway / Render / AWS / GCP |
| AIM Engine | Docker service |
| Database | Supabase PostgreSQL |
| Cache / Queue | Upstash / managed Redis |
| Storage | S3-compatible |
| Web / Admin | Vercel |
| Mobile | Google Play, later App Store |
| Monitoring | Sentry + structured logs |

**Deployment environments:**

- `local`
- `development`
- `staging`
- `production`

> Never deploy directly to production without a staging environment.

---

## 8. Correct Build Order

**Do not start like this:**

```
Mobile + Web + Admin + Voice + AI all at once
```

**Start in this order:**

1. Backend foundation
2. Database schema
3. Auth & users
4. Curriculum system
5. Placement test
6. AIM Engine integration
7. Student mobile MVP
8. AI Teacher text
9. Progress dashboard
10. Admin content dashboard
11. Quizzes / exams
12. Parent dashboard
13. AI Teacher voice
14. Payments
15. Advanced analytics
16. Production hardening

---

## 9. Proposed MVP

The first commercial release must contain only:

| Included in MVP |
|---|
| Student mobile app (Flutter) |
| Admin dashboard (basic) |
| Authentication (Supabase Auth) |
| Placement test |
| Learning path |
| Lessons |
| Questions |
| AIM Engine integration |
| AI Teacher text mode |
| Progress tracking |
| Basic reports |
| Basic notifications |

**Do NOT include in the first MVP:**

| Excluded from MVP |
|---|
| Full voice AI |
| Complex payment flows |
| Multi-school / multi-institute |
| Full human reviewer workflow |
| Advanced analytics |
| Marketplace |

> These come after proving that the core experience is excellent.

---

## 10. Critical Items Not Yet Mentioned

These items must enter the plan — they are not optional:

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
| 9 | Parent Consent Handling |
| 10 | Multi-language Support (Arabic / English) |
| 11 | Subscription Plans |
| 12 | Admin Audit Logs |
| 13 | Backup Strategy |
| 14 | Monitoring & Error Tracking |
| 15 | API Rate Limiting |
| 16 | Data Privacy Policy |
| 17 | Terms of Use |
| 18 | Teacher / Reviewer Role |
| 19 | Analytics Warehouse (later) |
| 20 | Support / Tickets System |

---

## 11. Final Recommended Decision

Adopt this stack:

| Layer | Decision |
|---|---|
| Mobile (learner client) | Flutter, feature-first, Riverpod StateNotifier |
| Student Web App | **Deferred / Optional** — not in Phase 1 |
| Admin Dashboard | Next.js |
| Backend API | NestJS TypeScript, feature-based |
| AIM Engine | Python backend service (called by Backend API only, never by clients) |
| Database | PostgreSQL / Supabase |
| Auth | Supabase Auth (locked default) |
| Cache / Queue | Redis + BullMQ |
| AI | AI Gateway inside the backend; LLM provider switchable; Text first, Voice later |
| Storage | S3-compatible |
| Deployment | Docker + staging + production |

---

## Closing Principle

> **The AIM Algorithm is the real product.**
>
> The AI Teacher is not just a chat interface — it is a teaching interface that uses the algorithm's decisions. Therefore, every question, answer, mistake, speed signal, attempt, hesitation, and retry must be converted into data that enters the AIM Engine, which then returns a clear, actionable learning decision.
