import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/routing.dart';
import 'package:aim_mobile/core/state/app_form_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/auth_sync_response_model.dart';
import 'package:aim_mobile/features/auth/data/models/login_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/refresh_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/register_result_model.dart';
import 'package:aim_mobile/features/auth/logic/provider/login_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/login_provider.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
import 'package:aim_mobile/features/auth/ui/pages/login_page.dart';

// ── Helpers ───────────────────────────────────────────────────────────────────

/// The primary sign-in submit button, distinct from the secondary
/// test-mode buttons rendered alongside it.
final Finder _submitButtonFinder = find.byWidgetPredicate(
  (widget) => widget is AIMButton && widget.variant == AIMButtonVariant.primary,
);

Widget _testApp({List<Override> overrides = const []}) {
  return ProviderScope(
    overrides: overrides,
    child: const MaterialApp(
      initialRoute: AppRoutePaths.signIn,
      onGenerateRoute: AppRouter.onGenerateRoute,
    ),
  );
}

/// No-op backend AuthRepository for tests that don't call submit().
class _FakeAuthRepository implements AuthRepository {
  @override
  Future<AuthContextModel> getMe(String bearerToken) async =>
      throw UnimplementedError('not called in UI-only tests');

  @override
  Future<AuthSyncResponseModel> syncUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
  }) async =>
      throw UnimplementedError('not called in UI-only tests');

  @override
  Future<void> logout(String bearerToken) async =>
      throw UnimplementedError('not called in UI-only tests');

  @override
  Future<LoginResult> login({
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError('not called in UI-only tests');

  @override
  Future<RefreshResult> refresh({required String refreshToken}) async =>
      throw UnimplementedError('not called in UI-only tests');

  @override
  Future<RegisterResult> register({
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError('not called in UI-only tests');

  @override
  Future<LoginResult> loginAsTestUser({required String role}) async =>
      throw UnimplementedError('not called in UI-only tests');
}

/// LoginNotifier subclass that starts with a preset error message.
class _ErrorLoginNotifier extends LoginNotifier {
  _ErrorLoginNotifier(Ref ref)
      : super(repository: _FakeAuthRepository(), ref: ref);

  void seedError(String message) {
    // Use the public clearError + internal path to surface an error.
    // We expose a test-only seeder so production code stays unmodified.
    state = AppFormState(errorMessage: message);
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  // ── Smoke ──────────────────────────────────────────────────────────────

  testWidgets('LoginPage renders AIM branding and form fields', (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(LoginPage), findsOneWidget);
    expect(find.text('Sign in to AIM'), findsOneWidget);
    expect(find.text('AIM'), findsOneWidget);
  });

  testWidgets('LoginPage uses AIM design system widgets', (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(AIMInput), findsNWidgets(2));   // email + password
    expect(find.byType(AIMButton), findsNWidgets(4));  // submit + 3 test-mode buttons
    expect(find.text("Don't have an account? Create one"), findsOneWidget);
  });

  // ── Submit button state ────────────────────────────────────────────────

  testWidgets('Submit button is disabled when form is empty', (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    final button = tester.widget<AIMButton>(_submitButtonFinder);
    expect(button.onPressed, isNull);
  });

  testWidgets('Submit button enables after valid email + password entered',
      (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    // Find the two TextField widgets inside AIMInput.
    final fields = find.byType(TextField);
    expect(fields, findsNWidgets(2));

    await tester.enterText(fields.first, 'learner@example.com');
    await tester.pump();
    await tester.enterText(fields.last, 'secret123');
    await tester.pump();

    final button = tester.widget<AIMButton>(_submitButtonFinder);
    expect(button.onPressed, isNotNull);
  });

  // ── Error banner ───────────────────────────────────────────────────────

  testWidgets('Error banner is hidden when there is no error', (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(AIMAlertBanner), findsNothing);
  });

  testWidgets('Error banner is shown when loginProvider surfaces an error',
      (tester) async {
    late _ErrorLoginNotifier capturedNotifier;

    await tester.pumpWidget(
      _testApp(
        overrides: [
          loginProvider.overrideWith((ref) {
            capturedNotifier = _ErrorLoginNotifier(ref);
            return capturedNotifier;
          }),
        ],
      ),
    );
    await tester.pump();

    // Seed an error through the test-only method.
    capturedNotifier.seedError('Invalid credentials');
    await tester.pump();

    expect(find.byType(AIMAlertBanner), findsOneWidget);
    expect(find.text('Invalid credentials'), findsOneWidget);
  });

  // ── RTL / Arabic ───────────────────────────────────────────────────────

  testWidgets('LoginPage renders without errors under Arabic RTL locale',
      (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          locale: Locale('ar'),
          initialRoute: AppRoutePaths.signIn,
          onGenerateRoute: AppRouter.onGenerateRoute,
        ),
      ),
    );
    await tester.pump();

    expect(find.byType(LoginPage), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
