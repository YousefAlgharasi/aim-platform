import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/config/app_config.dart';
import 'package:aim_mobile/core/config/app_config_provider.dart';
import 'package:aim_mobile/core/routing/routing.dart';
import 'package:aim_mobile/core/state/app_form_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/auth_sync_response_model.dart';
import 'package:aim_mobile/features/auth/data/models/login_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/refresh_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/register_result_model.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/login_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/login_provider.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
import 'package:aim_mobile/features/auth/ui/pages/login_page.dart';
import 'package:aim_mobile/features/auth/ui/pages/register_page.dart';

import '../../support/test_router_app.dart';

// ── Helpers ──────────────────────────────────────────────────────────────

/// The primary sign-in submit button, distinct from the secondary
/// test-mode/social buttons rendered alongside it.
final Finder _submitButtonFinder = find.byType(AIMGradientButton);

Widget _testApp({List<Override> overrides = const [], Locale? locale}) {
  return ProviderScope(
    overrides: [
      // Signed-out by default so AppRouter's redirect lets the sign-in
      // route through unchanged (it only special-cases `checking`,
      // `signedOut` on a protected route, and `signedIn` on an auth page —
      // none of which should divert away from /auth/sign-in here). Tests
      // that need a different auth state override this explicitly below.
      authFlowProvider.overrideWith((ref) => AuthFlowNotifier()
        ..completeBootstrap()),
      ...overrides,
    ],
    child: TestRouterApp(
      initialLocation: AppRoutePaths.signIn,
      locale: locale,
    ),
  );
}

/// A production [AppConfig] override, used to hide the developer test-mode
/// section the same way a real production build would.
const _productionConfig = AppConfig(
  environment: 'production',
  backendApiBaseUrl: 'https://api.example.com',
);

/// [AuthRepository] fake that always throws — every test in this file
/// either never submits, or only exercises local form/UI state, so the
/// network path should never actually be invoked.
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

/// A [LoginNotifier] double that lets a test (a) force the form into an
/// arbitrary [AppFormState] — e.g. mid-submit or carrying a backend error —
/// without touching the network, and (b) record every [setEmail]/
/// [setPassword] call the widget under test makes, so field-wiring can be
/// asserted without depending on validation internals.
class _RecordingLoginNotifier extends LoginNotifier {
  _RecordingLoginNotifier(Ref ref)
      : super(repository: _FakeAuthRepository(), ref: ref);

  final List<String> emailCalls = [];
  final List<String> passwordCalls = [];

  @override
  void setEmail(String value) {
    emailCalls.add(value);
    super.setEmail(value);
  }

  @override
  void setPassword(String value) {
    passwordCalls.add(value);
    super.setPassword(value);
  }

  /// Bypasses validation/network entirely to pin the form into whatever
  /// state a test needs to assert against (error banner, loading spinner).
  void seedState(AppFormState next) => state = next;
}

// ── Tests ────────────────────────────────────────────────────────────────

void main() {
  // ── Smoke ──────────────────────────────────────────

  testWidgets('LoginPage renders the gradient header copy', (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(LoginPage), findsOneWidget);
    expect(find.text('Welcome back'), findsOneWidget);
    expect(find.text('Sign in to keep your streak alive'), findsOneWidget);
  });

  testWidgets(
      'LoginPage uses AIM design-system widgets for inputs, submit, and social row',
      (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(AIMInput), findsNWidgets(2)); // email + password
    expect(find.byType(AIMGradientButton), findsOneWidget); // Sign In
    // Non-production by default in tests: 3 social (visual-only) +
    // 3 test-mode role shortcuts + 1 endpoint-tester link.
    expect(find.byType(AIMButton), findsNWidgets(7));
    expect(find.text('Continue with Google'), findsOneWidget);
    expect(find.text('Apple'), findsOneWidget);
    expect(find.text('Facebook'), findsOneWidget);
    expect(find.text("Don't have an account? Create one"), findsOneWidget);
  });

  // ── Submit button state ─────────────────────────────

  testWidgets('Submit button is disabled when the form is empty',
      (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    final button = tester.widget<AIMGradientButton>(_submitButtonFinder);
    expect(button.enabled, isFalse);
  });

  testWidgets('Submit button enables once a valid email + password are entered',
      (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    final fields = find.byType(TextField);
    expect(fields, findsNWidgets(2));

    await tester.enterText(fields.first, 'learner@example.com');
    await tester.pump();
    await tester.enterText(fields.last, 'secret123');
    await tester.pump();

    final button = tester.widget<AIMGradientButton>(_submitButtonFinder);
    expect(button.enabled, isTrue);
  });

  // ── Field wiring ─────────────────────────────────────

  testWidgets('Entering email and password forwards values to LoginNotifier',
      (tester) async {
    late _RecordingLoginNotifier notifier;

    await tester.pumpWidget(
      _testApp(
        overrides: [
          loginProvider.overrideWith((ref) {
            notifier = _RecordingLoginNotifier(ref);
            return notifier;
          }),
        ],
      ),
    );
    await tester.pump();

    final fields = find.byType(TextField);
    await tester.enterText(fields.first, 'learner@example.com');
    await tester.enterText(fields.last, 'secret123');
    await tester.pump();

    expect(notifier.emailCalls, contains('learner@example.com'));
    expect(notifier.passwordCalls, contains('secret123'));
  });

  // ── Error banner ─────────────────────────────────────

  testWidgets('Error banner is hidden when there is no error', (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(AIMAlertBanner), findsNothing);
  });

  testWidgets('Error banner appears with the backend message once seeded',
      (tester) async {
    late _RecordingLoginNotifier notifier;

    await tester.pumpWidget(
      _testApp(
        overrides: [
          loginProvider.overrideWith((ref) {
            notifier = _RecordingLoginNotifier(ref);
            return notifier;
          }),
        ],
      ),
    );
    await tester.pump();

    notifier.seedState(
      const AppFormState(errorMessage: 'Wrong email or password. Try again.'),
    );
    await tester.pump();

    expect(find.byType(AIMAlertBanner), findsOneWidget);
    expect(
      find.text('Wrong email or password. Try again.'),
      findsOneWidget,
    );
  });

  // ── Submitting / loading state ───────────────────────

  testWidgets('Sign In button shows its loading state while submitting',
      (tester) async {
    late _RecordingLoginNotifier notifier;

    await tester.pumpWidget(
      _testApp(
        overrides: [
          loginProvider.overrideWith((ref) {
            notifier = _RecordingLoginNotifier(ref);
            return notifier;
          }),
        ],
      ),
    );
    await tester.pump();

    notifier.seedState(
      const AppFormState(isValid: true, isSubmitting: true),
    );
    await tester.pump();

    final button = tester.widget<AIMGradientButton>(_submitButtonFinder);
    expect(button.loading, isTrue);
  });

  // ── Navigation ───────────────────────────────────────

  testWidgets('Tapping "Create one" navigates to the register screen',
      (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    // The link sits below the fold on the default test viewport; scroll it
    // into view so the tap lands inside the Scrollable's clipped hit-test
    // area (a plain `find` would succeed either way, but `tap` requires the
    // target to actually be visible).
    final createOneLink = find.text("Don't have an account? Create one");
    await tester.scrollUntilVisible(
      createOneLink,
      300,
      scrollable: find.byType(Scrollable).first,
    );
    // scrollUntilVisible stops as soon as any part of the target enters the
    // viewport, which can leave its center (where tap() aims) still
    // off-screen. ensureVisible scrolls until the whole target is in view.
    await tester.ensureVisible(createOneLink);
    await tester.pumpAndSettle();

    await tester.tap(createOneLink);
    await tester.pumpAndSettle();

    expect(find.byType(RegisterPage), findsOneWidget);
    expect(find.byType(LoginPage), findsNothing);
  });

  // ── Developer test-mode section ──────────────────────

  testWidgets('Test-mode shortcuts are present outside production',
      (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.text('Test mode'), findsOneWidget);
    expect(find.text('Student'), findsOneWidget);
    expect(find.text('Parent'), findsOneWidget);
    expect(find.text('Admin'), findsOneWidget);
    expect(find.text('Open API Endpoint Tester'), findsOneWidget);
  });

  testWidgets('Test-mode shortcuts are absent in production',
      (tester) async {
    await tester.pumpWidget(
      _testApp(
        overrides: [
          appConfigProvider.overrideWithValue(_productionConfig),
        ],
      ),
    );
    await tester.pump();

    expect(find.text('Test mode'), findsNothing);
    expect(find.text('Student'), findsNothing);
    expect(find.text('Parent'), findsNothing);
    expect(find.text('Admin'), findsNothing);
    expect(find.text('Open API Endpoint Tester'), findsNothing);
    // Only the 3 visual-only social buttons remain.
    expect(find.byType(AIMButton), findsNWidgets(3));
  });

  // ── RTL / Arabic ─────────────────────────────────────

  testWidgets('LoginPage renders without errors under Arabic RTL locale',
      (tester) async {
    await tester.pumpWidget(_testApp(locale: const Locale('ar')));
    await tester.pump();

    expect(find.byType(LoginPage), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
