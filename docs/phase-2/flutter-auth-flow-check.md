# Flutter Auth Flow Check

Task: P2-050

## Scope

This check covers the Phase 2 Flutter auth flow for the mobile app:

- login
- register
- current user context
- session expired handling
- logout
- auth-state routing

It verifies that Flutter uses backend-approved auth state and does not become the authority for identity, roles, permissions, or profile ownership.

Out of scope:

- onboarding
- placement
- lessons
- practice
- AIM Engine integration
- dashboard recommendations
- Student Web App work

## Source of Truth

Flutter is not the auth authority.

The mobile app may:

- collect credentials through login/register UI
- call Supabase Auth with the public anon key only
- pass a bearer token to the backend
- display client-safe auth context returned by the backend
- use route guards for UX
- clear local state on logout or expired session

The backend remains the final authority for:

- mapping Supabase users to internal users
- user status
- roles
- permissions
- profile access
- ownership checks
- safe field exposure

## Dependency Outputs Checked

- P2-042: Flutter auth models exist under `apps/mobile/lib/features/auth/data/models/`.
- P2-043: Flutter auth remote datasource exists under `apps/mobile/lib/features/auth/data/datasources/`.
- P2-044: Flutter auth repository and providers exist under `apps/mobile/lib/features/auth/logic/`.
- P2-045: Login UI exists at `apps/mobile/lib/features/auth/ui/pages/login_page.dart`.
- P2-046: Register UI exists at `apps/mobile/lib/features/auth/ui/pages/register_page.dart`.
- P2-047: Auth-state routing exists in `apps/mobile/lib/core/routing/app_router.dart`.
- P2-048: Session-expired handling exists in `auth_context_notifier.dart`.
- P2-049: Logout cleanup exists in `logout_notifier.dart`.

## Flow Verification

| Flow | Verified behavior | Evidence |
| --- | --- | --- |
| Login | Login collects email/password, calls Supabase Auth, then syncs and loads backend auth context before setting signed-in state. | `login_notifier.dart`, `login_page.dart` |
| Register | Register calls Supabase signup, handles email confirmation, and only signs in after backend sync/context load succeeds. | `register_notifier.dart`, `register_page.dart` |
| Current user | Flutter stores only `AuthContextModel` returned by backend `/auth/me` style context loading. | `auth_context_notifier.dart`, `auth_context_provider.dart` |
| Session expired | Unauthorized backend auth failures clear auth context and move auth flow to signed out. | `auth_context_notifier.dart`, `auth_context_notifier_test.dart` |
| Logout | Logout attempts backend logout, then always clears local auth context and signs out even if backend logout fails. | `logout_notifier.dart`, `logout_provider.dart` |
| Routing | Signed-out users are redirected away from protected app areas; signed-in, profile-ready users are routed away from auth pages. | `app_router.dart`, `app_router_test.dart`, `auth_placeholder_flow_test.dart` |

## Security Checks

- No Supabase service-role key is used by Flutter.
- No Supabase JWT secret is used by Flutter.
- No database credentials are used by Flutter.
- Flutter uses only public client-safe Supabase config: `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- Flutter route guards are UX-only and do not replace backend authorization.
- Role and permission behavior in Flutter is not treated as security enforcement.
- Auth context models contain client-safe user, profile, role, and permission data only.
- Session-expired handling clears local state instead of keeping stale authenticated UI state.

## Test Coverage

Current mobile test coverage includes:

- `apps/mobile/test/core/routing/app_router_test.dart`
  - redirects protected routes for unauthenticated users
  - keeps checking users on splash
  - routes signed-in profile-ready users away from auth pages
  - navigates from splash to sign-in page
- `apps/mobile/test/features/auth/auth_context_notifier_test.dart`
  - signs out when backend rejects an expired session
- `apps/mobile/test/features/auth/auth_placeholder_flow_test.dart`
  - routes signed-out users away from protected app areas
- `apps/mobile/test/features/auth/auth_flow_notifier_test.dart`
  - verifies auth flow state transitions

## Checks Run

```text
flutter analyze
flutter test
```

Result:

```text
No issues found.
All tests passed.
```

## Limitations

- Token acquisition is still provided by the current Supabase Auth REST flow and passed into backend auth calls by the relevant notifier.
- Flutter cannot enforce backend security rules; it only reflects backend-approved state.
- Future profile and role-aware UI tasks must continue treating Flutter role behavior as UX only.

## Result

Pass.

The Flutter auth flow uses backend-approved auth context, protects app areas through UX routing, clears stale state on expired sessions and logout, and does not expose privileged credentials or make Flutter the authority for roles, permissions, ownership, or user status.
