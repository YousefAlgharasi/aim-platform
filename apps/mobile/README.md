# AIM Mobile

Flutter Mobile learner client shell for AIM Phase 1.

## Auth Placeholder Flow

P1-045 adds placeholder auth UI and in-memory auth state.

Included:

- splash auth-state placeholder
- sign-in placeholder page
- placeholder learner email field
- placeholder signed-in state
- placeholder sign-out action from Profile
- tests for auth state and UI flow

## Not Implemented

This task does not implement:

- Supabase authentication
- token storage
- refresh token handling
- backend auth endpoints
- real sign-in
- real sign-out
- account creation
- password reset
- social login
- OTP login

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
