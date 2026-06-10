# Flutter Feature-First Structure

This folder contains Phase 1 Flutter Mobile feature skeletons.

## Required Features

- `auth`
- `onboarding`
- `placement`
- `home`
- `lessons`
- `practice`
- `ai_teacher`
- `reviews`
- `progress`
- `notifications`
- `profile`

## Feature Folder Convention

Each feature follows the same structure:

```text
data/datasources
data/models
data/repository/repo_impl
logic/entity
logic/provider
logic/repository
ui/pages
ui/widgets
```

## Phase 1 Rules

These folders are architecture placeholders only.

Do not add:

- AIM mastery calculations
- learner level calculations
- weakness detection
- difficulty adaptation
- retention scheduling
- recommendation generation
- direct AIM Engine calls
- direct AI provider calls
- privileged secrets or service-role keys
- Student Web App work

Flutter Mobile renders backend-approved outputs only.
