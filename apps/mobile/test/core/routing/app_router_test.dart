import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/routing.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/auth_sync_response_model.dart';
import 'package:aim_mobile/features/auth/data/models/client_safe_profile_model.dart';
import 'package:aim_mobile/features/auth/data/models/current_user_model.dart';
import 'package:aim_mobile/features/auth/data/models/login_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/refresh_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/register_result_model.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_flow_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/app_bootstrap_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/app_bootstrap_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';

import '../../support/test_router_app.dart';

void main() {
  // ── resolveRouteName unit tests ─────────────────────────────
  // (Business logic is unchanged by the GoRouter migration — only the
  // mechanism that acts on it, `redirect` instead of an imperative push
  // from AuthGate, changed.)

  test('redirects protected routes for unauthenticated users', () {
    final resolvedRoute = AppRouter.resolveRouteName(
      AppRoutePaths.mainShell,
      authState: const AuthFlowState.signedOut(),
    );

    expect(resolvedRoute, AppRoutePaths.signIn);
  });

  test('redirects placement routes for unauthenticated users', () {
    final resolvedRoute = AppRouter.resolveRouteName(
      AppRoutePaths.placementStart,
      authState: const AuthFlowState.signedOut(),
    );

    expect(resolvedRoute, AppRoutePaths.signIn);
  });

  test('keeps checking users on splash', () {
    final resolvedRoute = AppRouter.resolveRouteName(
      AppRoutePaths.profile,
      authState: const AuthFlowState.checking(),
    );

    expect(resolvedRoute, AppRoutePaths.splash);
  });

  test('routes signed-in profile-ready users away from auth pages', () {
    final resolvedRoute = AppRouter.resolveRouteName(
      AppRoutePaths.signIn,
      authState: const AuthFlowState.signedIn(
        email: 'learner@example.com',
        accessToken: 'token-1',
      ),
      authContextState: const AppAsyncState<AuthContextModel>.success(
        _authContext,
      ),
    );

    expect(resolvedRoute, AppRoutePaths.mainShell);
  });

  test('resolveRouteName returns splash when requestedRoute is splash and checking', () {
    final resolvedRoute = AppRouter.resolveRouteName(
      AppRoutePaths.splash,
      authState: const AuthFlowState.checking(),
    );

    expect(resolvedRoute, AppRoutePaths.splash);
  });

  test('allows access to public auth routes when signed out', () {
    final resolvedRoute = AppRouter.resolveRouteName(
      AppRoutePaths.register,
      authState: const AuthFlowState.signedOut(),
    );

    expect(resolvedRoute, AppRoutePaths.register);
  });

  // ── GoRouter redirect + AuthGate widget tests ────────────────

  testWidgets('AuthGate auto-navigates to sign-in when bootstrap completes with signedOut',
      (tester) async {
    // Override authFlowProvider so the session check immediately resolves to
    // signedOut (bypassing the async microtask in AppBootstrapNotifier).
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          appBootstrapProvider.overrideWith(
            (ref) => _ImmediateDoneBootstrap(ref),
          ),
          authFlowProvider.overrideWith(
            (ref) {
              final notifier = AuthFlowNotifier();
              // Immediately complete the bootstrap so the gate sees signedOut.
              notifier.completeBootstrap();
              return notifier;
            },
          ),
        ],
        child: const TestRouterApp(),
      ),
    );

    // Allow all async work and frame callbacks to complete.
    await tester.pumpAndSettle();

    // AppRouter's redirect should have taken the splash route straight to
    // /auth/sign-in once authFlowProvider resolved to signedOut.
    expect(find.text('Welcome back'), findsOneWidget);
  });

  testWidgets('splash shows AIM branding while checking', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: TestRouterApp(),
      ),
    );

    // First frame: authFlowProvider starts in checking state.
    await tester.pump();

    expect(find.text('AIM'), findsOneWidget);
    // Redesigned splash shows static "Tap to continue" copy while checking
    // (see splash_page.dart) instead of the old "Checking your session…".
    expect(find.text('Tap to continue'), findsOneWidget);
  });

  testWidgets('falls back to splash when placement question arguments are missing',
      (tester) async {
    // Signed-in + profile-ready so `redirect` lets the request through to
    // the placement question route unchanged (this test is about the route
    // builder's own argument validation, not auth gating).
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authFlowProvider.overrideWith(
            (ref) => AuthFlowNotifier()
              ..signIn('learner@example.com', accessToken: 'tok-abc'),
          ),
          authContextProvider.overrideWith(
            (ref) => _ImmediateAuthContextNotifier(ref),
          ),
        ],
        child: const TestRouterApp(
          initialLocation: AppRoutePaths.placementQuestion,
        ),
      ),
    );
    await tester.pump();

    expect(find.text('AIM'), findsOneWidget);
  });
}

// ── Test doubles ─────────────────────────────────────────

/// Resolves immediately to done without hitting any async path.
class _ImmediateDoneBootstrap extends AppBootstrapNotifier {
  _ImmediateDoneBootstrap(super.ref);

  @override
  Future<void> checkSession() async {
    if (mounted) state = AppBootstrapStatus.done;
  }
}

/// Resolves immediately to a successful auth context, without touching the
/// network — used by tests that need `hasProfileReadyContext` to be true.
class _ImmediateAuthContextNotifier extends AuthContextNotifier {
  _ImmediateAuthContextNotifier(Ref ref)
      : super(repository: _UnusedAuthRepository(), ref: ref) {
    state = const AppAsyncState<AuthContextModel>.success(_authContext);
  }
}

/// Never actually called by [_ImmediateAuthContextNotifier] — state is set
/// directly in the constructor — so every method just throws.
class _UnusedAuthRepository implements AuthRepository {
  @override
  Future<AuthContextModel> getMe(String bearerToken) =>
      throw UnimplementedError();

  @override
  Future<void> logout(String bearerToken) => throw UnimplementedError();

  @override
  Future<LoginResult> login({
    required String email,
    required String password,
  }) =>
      throw UnimplementedError();

  @override
  Future<LoginResult> loginAsTestUser({required String role}) =>
      throw UnimplementedError();

  @override
  Future<RefreshResult> refresh({required String refreshToken}) =>
      throw UnimplementedError();

  @override
  Future<RegisterResult> register({
    required String email,
    required String password,
  }) =>
      throw UnimplementedError();

  @override
  Future<AuthSyncResponseModel> syncUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
  }) =>
      throw UnimplementedError();
}

const _timestamp = '2026-06-12T00:00:00.000Z';

const _authContext = AuthContextModel(
  user: CurrentUserModel(
    id: 'user-1',
    email: 'learner@example.com',
    userType: 'student',
    status: 'active',
  ),
  profile: ClientSafeProfileModel(
    id: 'profile-1',
    userId: 'user-1',
    profileType: 'student',
    displayName: 'Learner',
    createdAt: _timestamp,
    updatedAt: _timestamp,
  ),
  roles: [],
  permissions: [],
);
