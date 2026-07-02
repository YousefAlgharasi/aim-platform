import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/routing.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/client_safe_profile_model.dart';
import 'package:aim_mobile/features/auth/data/models/current_user_model.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_flow_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/app_bootstrap_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/app_bootstrap_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';

void main() {
  // ── resolveRouteName unit tests ─────────────────────────────

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

  // ── AuthGate widget tests ─────────────────────────────────

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
        child: const MaterialApp(
          initialRoute: AppRoutePaths.splash,
          onGenerateRoute: AppRouter.onGenerateRoute,
        ),
      ),
    );

    // Allow all async work and frame callbacks to complete.
    await tester.pumpAndSettle();

    // After bootstrap the AuthGate should have pushed /auth/sign-in.
    expect(find.text('Welcome back'), findsOneWidget);
  });

  testWidgets('splash shows AIM branding while checking', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          initialRoute: AppRoutePaths.splash,
          onGenerateRoute: AppRouter.onGenerateRoute,
        ),
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
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          initialRoute: AppRoutePaths.placementQuestion,
          onGenerateRoute: AppRouter.onGenerateRoute,
        ),
      ),
    );

    expect(find.text('AIM'), findsOneWidget);
  });
}

class _ImmediateDoneBootstrap extends AppBootstrapNotifier {
  _ImmediateDoneBootstrap(super.ref);

  @override
  Future<void> checkSession() async {
    if (mounted) state = AppBootstrapStatus.done;
  }
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
