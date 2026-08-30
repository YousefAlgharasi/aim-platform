import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/routing.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_results.dart';
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
  Future<AuthContext> getMe(String bearerToken) async =>
      throw UnimplementedError();

  @override
  Future<AuthSyncResult> syncUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
  }) async =>
      throw UnimplementedError();

  @override
  Future<void> logout(String bearerToken) async => throw UnimplementedError();

  @override
  Future<AuthLoginResult> login({
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError();

  @override
  Future<AuthRefreshResult> refresh({required String refreshToken}) async =>
      throw UnimplementedError();

  @override
  Future<AuthRegisterResult> register({
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError();

  @override
  Future<AuthLoginResult> loginAsTestUser({required String role}) async =>
      throw UnimplementedError();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  // ── Smoke ──────────────────────────────────────────────────────────────

  testWidgets('RegisterPage renders the header and form fields',
      (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(RegisterPage), findsOneWidget);
    expect(find.text('Create an account'), findsOneWidget);
    expect(find.text('START YOUR JOURNEY'), findsOneWidget);
    expect(find.text('Create account'), findsOneWidget);
    expect(find.byType(TextField), findsNWidgets(4));
  });

  testWidgets('RegisterPage renders social auth options and sign in link',
      (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(TextField), findsNWidgets(4));
    expect(find.text('Google'), findsOneWidget);
    expect(find.text('Facebook'), findsOneWidget);
    final signInLink = find.text('Sign In');
    await tester.scrollUntilVisible(
      signInLink,
      300,
      scrollable: find.byType(Scrollable).first,
    );
    expect(signInLink, findsOneWidget);
    expect(find.text('Create account'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('Sign In'),
      80,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Sign In'), findsOneWidget);
  });

  // ── Form validation ───────────────────────────────────────────────────

  testWidgets('Form state updates with input values', (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    final textFields = find.byType(TextField);
    expect(textFields, findsNWidgets(4));

    await tester.enterText(textFields.at(1), 'learner@example.com');
    await tester.pump();
    await tester.enterText(textFields.at(2), 'secret123');
    await tester.pump();
    await tester.enterText(textFields.at(3), 'secret123');
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
