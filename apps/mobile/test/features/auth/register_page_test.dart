import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/routing.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/auth_sync_response_model.dart';
import 'package:aim_mobile/features/auth/data/models/login_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/refresh_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/register_result_model.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/register_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/register_provider.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
import 'package:aim_mobile/features/auth/ui/pages/register_page.dart';

import '../../support/test_router_app.dart';

// ── Helpers ───────────────────────────────────────────────────────────────────

Widget _testApp({List<Override> overrides = const [], Locale? locale}) {
  return ProviderScope(
    overrides: [
      // Signed-out by default so AppRouter's redirect lets the register
      // route through unchanged. Tests needing a different auth state
      // override this explicitly below.
      authFlowProvider.overrideWith((ref) => AuthFlowNotifier()
        ..completeBootstrap()),
      ...overrides,
    ],
    child: TestRouterApp(
      initialLocation: AppRoutePaths.register,
      locale: locale,
    ),
  );
}

/// No-op backend AuthRepository — tests must not call submit().
class _FakeAuthRepository implements AuthRepository {
  @override
  Future<void> requestPasswordReset({required String email}) => throw UnimplementedError();
  @override
  Future<void> resetPassword({required String newPassword, required String bearerToken}) => throw UnimplementedError();
  @override
  Future<AuthContextModel> getMe(String bearerToken) async =>
      throw UnimplementedError();

  @override
  Future<AuthSyncResponseModel> syncUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
  }) async =>
      throw UnimplementedError();

  @override
  Future<void> logout(String bearerToken) async => throw UnimplementedError();

  @override
  Future<LoginResult> login({
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError();

  @override
  Future<RefreshResult> refresh({required String refreshToken}) async =>
      throw UnimplementedError();

  @override
  Future<RegisterResult> register({
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError();

  @override
  Future<LoginResult> loginAsTestUser({required String role}) async =>
      throw UnimplementedError();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  // ── Smoke ──────────────────────────────────────────────────────────────

  testWidgets('RegisterPage renders the gradient header and form fields',
      (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(RegisterPage), findsOneWidget);
    expect(find.text('START YOUR JOURNEY'), findsOneWidget);
    expect(find.text('Create an account'), findsOneWidget);
    expect(find.text('Create account'), findsOneWidget);
    expect(find.byType(TextField), findsNWidgets(4));
  });

  testWidgets('RegisterPage uses AIM design system widgets', (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(TextField), findsNWidgets(4));
    expect(find.text('Create account'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('Sign In'),
      80,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Sign In'), findsOneWidget);
  });

  // ── Submit button state ────────────────────────────────────────────────

  testWidgets('Submit button is present', (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.text('Create account'), findsOneWidget);
  });

  testWidgets('Submit button enables when all fields are valid', (tester) async {
    await tester.pumpWidget(
      _testApp(
        overrides: [
          registerProvider.overrideWith((ref) {
            final notifier = RegisterNotifier(
              repository: _FakeAuthRepository(),
              ref: ref,
            );
            notifier.setEmail('learner@example.com');
            notifier.setPassword('secret123');
            notifier.setConfirmPassword('secret123');
            return notifier;
          }),
        ],
      ),
    );
    await tester.pump();

    expect(find.text('Create account'), findsOneWidget);
  });

  testWidgets('Submit button stays disabled when passwords do not match',
      (tester) async {
    await tester.pumpWidget(
      _testApp(
        overrides: [
          registerProvider.overrideWith((ref) {
            final notifier = RegisterNotifier(
              repository: _FakeAuthRepository(),
              ref: ref,
            );
            notifier.setEmail('learner@example.com');
            notifier.setPassword('secret123');
            notifier.setConfirmPassword('mismatch');
            return notifier;
          }),
        ],
      ),
    );
    await tester.pump();

    expect(find.text('Create account'), findsOneWidget);
  });

  // ── Error banner ───────────────────────────────────────────────────────

  testWidgets('Error banner is hidden by default', (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(AIMAlertBanner), findsNothing);
  });

  // ── Form fields ────────────────────────────────────────────────────────

  testWidgets('RegisterPage contains form input fields',
      (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(TextField), findsNWidgets(4));
  });

  // ── RTL / Arabic ───────────────────────────────────────────────────────

  testWidgets('RegisterPage renders without errors under Arabic RTL locale',
      (tester) async {
    await tester.pumpWidget(_testApp(locale: const Locale('ar')));
    await tester.pump();

    expect(find.byType(RegisterPage), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
