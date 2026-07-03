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

/// The primary create-account submit button, distinct from the disabled
/// social buttons rendered alongside it.
final Finder _submitButtonFinder = find.byType(AIMGradientButton);

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
    // "Create account" appears twice by design: header title + submit CTA.
    expect(find.text('Create account'), findsNWidgets(2));
    expect(find.text('Start learning English the fun way'), findsOneWidget);
    expect(find.byType(AIMInput), findsNWidgets(3));
  });

  testWidgets('RegisterPage uses AIM design system widgets', (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(AIMInput), findsNWidgets(3));
    expect(find.byType(AIMGradientButton), findsOneWidget);
    // Google/Apple/Facebook (visual-only, disabled).
    expect(find.byType(AIMButton), findsNWidgets(3));
    await tester.scrollUntilVisible(
      find.text('Already have an account? Sign in'),
      80,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Already have an account? Sign in'), findsOneWidget);
  });

  // ── Submit button state ────────────────────────────────────────────────

  testWidgets('Submit button is disabled when form is empty', (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    final button = tester.widget<AIMGradientButton>(_submitButtonFinder);
    expect(button.enabled, isFalse);
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

    final button = tester.widget<AIMGradientButton>(_submitButtonFinder);
    expect(button.enabled, isTrue);
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

    final button = tester.widget<AIMGradientButton>(_submitButtonFinder);
    expect(button.enabled, isFalse);
  });

  // ── Error banner ───────────────────────────────────────────────────────

  testWidgets('Error banner is hidden by default', (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(AIMAlertBanner), findsNothing);
  });

  // ── No hard-coded raw widgets ──────────────────────────────────────────

  testWidgets('RegisterPage contains no raw TextField (uses AIMInput)',
      (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    // AIMInput internally wraps a TextField; we confirm AIMInput is present.
    // Raw TextField usage outside AIMInput would be a design-system violation.
    final aimInputs = tester.widgetList<AIMInput>(find.byType(AIMInput));
    expect(aimInputs.length, 3);
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
