# AIM Mobile

Flutter Mobile learner client shell for AIM Phase 1.

## Main Shell Placeholder Screens

P1-044 adds placeholder screens for the main learner shell:

- Home
- Learn
- Review
- Progress
- Profile

The shell uses a Material 3 `NavigationBar` and an `IndexedStack` to switch between placeholders.

## Not Implemented

This task does not implement:

- feature data loading
- Backend API calls
- auth behavior
- local progress calculation
- local mastery calculation
- local level calculation
- weakness detection
- difficulty adaptation
- retention scheduling
- recommendation generation

## Phase 1 Rules

Flutter Mobile must not:

- calculate mastery
- calculate learner level
- detect weakness
- adapt difficulty
- schedule retention
- generate recommendations
- call AIM Engine directly
- call AI Teacher provider or gateway directly
- store provider keys, Supabase service-role keys, or privileged backend credentials
- implement Student Web App behavior

Flutter Mobile sends learner evidence to the Backend API and renders backend-approved outputs only.

## Local Checks

```bash
cd apps/mobile
flutter pub get
flutter analyze
flutter test
```
