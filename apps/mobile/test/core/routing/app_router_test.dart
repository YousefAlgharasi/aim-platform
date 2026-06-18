import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/routing.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/client_safe_profile_model.dart';
import 'package:aim_mobile/features/auth/data/models/current_user_model.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_flow_state.dart';

void main() {
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

  testWidgets('can navigate from splash to sign-in page', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          initialRoute: AppRoutePaths.splash,
          onGenerateRoute: AppRouter.onGenerateRoute,
        ),
      ),
    );

    expect(find.text('AIM'), findsOneWidget);

    await tester.tap(find.text('Start auth placeholder flow'));
    await tester.pumpAndSettle();

    expect(find.text('Sign In'), findsWidgets);
    expect(find.text('Sign in to AIM'), findsOneWidget);
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
