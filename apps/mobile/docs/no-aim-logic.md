# No AIM Logic in Flutter

## Purpose

This document defines the Flutter Mobile boundary for AIM Phase 1.

Flutter Mobile is the learner-facing client. It may collect learner input and render backend-approved outputs, but it must not calculate adaptive learning intelligence locally.

## Non-Negotiable Rule

Flutter Mobile must not calculate AIM outputs.

AIM outputs include:

- mastery
- learner level
- weakness
- difficulty
- retention schedule
- recommendations
- next lesson decisions
- emotional/frustration interpretation
- skill-state updates
- adaptive session summaries
- placement score decisions beyond displaying backend-approved results

Flutter Mobile sends learner evidence to the Backend API and renders backend-approved outputs only.

## Allowed Flutter Responsibilities

Flutter Mobile may:

- render learner-facing screens
- collect form input
- collect lesson/session answers
- collect safe interaction events
- call the Backend API
- display backend-approved lessons
- display backend-approved progress summaries
- display backend-approved recommendations
- display backend-approved review reminders
- cache safe display data when a later task explicitly approves it
- show UI loading, empty, success, and error states
- perform basic UI validation for input shape, such as empty fields or invalid email format

## Forbidden Flutter Responsibilities

Flutter Mobile must not:

- calculate mastery score
- calculate learner level
- detect weakness
- classify error patterns
- adapt question difficulty
- schedule retention reviews
- generate recommendations
- decide the next lesson
- decide the next skill
- decide whether a learner is weak in a skill
- infer frustration or emotional state
- calculate adaptive session completion outputs
- rank lessons based on local learner performance
- call AIM Engine directly
- call AI Teacher provider APIs directly
- call OpenAI or other AI providers directly
- store AI provider keys
- store Supabase service-role keys
- store database credentials
- bypass Backend API ownership checks
- expose raw AIM Engine internals to the learner

## Evidence vs Output

Flutter may collect evidence.

Examples of learner evidence:

- selected answer
- typed answer
- quiz response
- lesson completion event
- retry count
- hint usage
- elapsed time
- submitted timestamp
- device-safe UI metadata

Flutter must send this evidence to the Backend API.

Flutter must not transform this evidence into AIM outputs.

Examples of forbidden local transformations:

```text
answer correctness + time spent -> mastery
fast answer -> higher level
slow answer -> weakness
retry count -> difficulty decrease
hint usage -> retention schedule
local quiz result -> next lesson recommendation
```

The Backend API and AIM Engine own these decisions.

## Speed and Response Time Rule

Speed, response time, average response time, or speed score must not directly increase:

- mastery
- learner level
- difficulty

Flutter may record elapsed time as evidence only when a future feature task requires it.

Flutter must not convert elapsed time into an adaptive-learning decision.

## Backend API Boundary

Flutter communicates with the Backend API only.

```text
Flutter Mobile
  |
  | learner evidence / API request
  v
Backend API
  |
  | validated internal request
  v
AIM Engine
```

The Backend API is responsible for:

- authentication boundary
- authorization boundary
- ownership checks
- response shaping
- AIM Engine mediation
- AI Teacher mediation
- safe learner-facing output approval

## AIM Engine Boundary

AIM Engine is backend-only.

Flutter must not import, reimplement, call, or simulate AIM Engine logic.

Flutter must not contain duplicated AIM formulas or fallback AIM calculations.

If AIM Engine is unavailable, Flutter should show a backend-approved error or fallback response from the Backend API.

## AI Teacher Boundary

AI Teacher is backend-only.

Flutter may display AI Teacher responses returned by the Backend API.

Flutter must not:

- call AI providers directly
- send learner data directly to provider APIs
- store provider keys
- perform safety validation locally as the final authority
- expose raw provider output if the backend rejects it

## Feature Folder Guidance

Feature folders may contain UI, state, entities, repositories, and data source abstractions.

Allowed examples:

```text
lib/features/lessons/ui/pages/lesson_page.dart
lib/features/practice/logic/provider/practice_form_notifier.dart
lib/features/progress/data/models/progress_summary_model.dart
```

Forbidden examples:

```text
lib/features/progress/logic/mastery_calculator.dart
lib/features/practice/logic/difficulty_adapter.dart
lib/features/reviews/logic/retention_scheduler.dart
lib/features/lessons/logic/recommendation_engine.dart
lib/features/placement/logic/level_calculator.dart
```

## Code Review Checklist

Before approving Flutter Mobile code, verify:

- No mastery calculation exists.
- No learner level calculation exists.
- No weakness detection exists.
- No difficulty adaptation exists.
- No retention scheduling exists.
- No recommendation generation exists.
- No AIM Engine direct URL exists.
- No AI provider direct URL exists.
- No service-role key exists.
- No database credential exists.
- No local fallback implements AIM decisions.
- Flutter calls Backend API only for protected learning flows.
- Flutter renders backend-approved outputs only.

## Search Terms to Watch

During review, search Flutter code for:

```text
mastery
level
weakness
difficulty
retention
recommendation
recommend
nextLesson
next_lesson
skillState
skill_state
frustration
emotion
aimEngine
AIM_ENGINE
openai
service_role
SUPABASE_SERVICE_ROLE
DATABASE_URL
```

These terms are not automatically forbidden, but they require careful review to ensure Flutter is not calculating or exposing protected AIM internals.

## Acceptable Display Models

Flutter may define display models for backend-approved outputs.

Example:

```dart
class ProgressSummaryViewModel {
  const ProgressSummaryViewModel({
    required this.title,
    required this.subtitle,
    required this.progressPercent,
  });

  final String title;
  final String subtitle;
  final double progressPercent;
}
```

The value must come from the Backend API or be purely presentational.

Flutter must not derive AIM scores from raw learner evidence.

## Testing Direction

Flutter tests should verify:

- UI state changes.
- navigation.
- form validation.
- response envelope parsing.
- backend-client error handling.
- rendering backend-provided values.

Flutter tests must not assert local AIM calculations.

A forbidden test shape:

```text
given attempts and time spent,
when local Flutter function runs,
then mastery increases
```

A valid test shape:

```text
given backend progress summary,
when Progress page renders,
then summary text appears
```

## Final Rule

Flutter Mobile is a learner experience layer.

AIM intelligence belongs to Backend API and AIM Engine boundaries.

When in doubt:

```text
Flutter collects evidence.
Backend validates ownership.
AIM Engine computes learning intelligence.
Backend shapes safe response.
Flutter renders the result.
```
