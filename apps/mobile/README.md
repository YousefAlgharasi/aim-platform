# AIM Mobile

Flutter Mobile learner client shell for AIM Phase 1.

## Routing Shell

P1-043 adds the Flutter routing shell.

Routes:

```text
/
 /auth/sign-in
 /main
 /main/home
 /main/learn
 /main/review
 /main/progress
 /main/profile
```

The routes display placeholder screens only.

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
