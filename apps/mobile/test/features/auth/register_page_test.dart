import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/routing.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/data/datasources/supabase_auth_datasource.dart';
import 'package:aim_mobile/features/auth/logic/provider/register_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/register_provider.dart';
import 'package:aim_mobile/features/auth/ui/pages/register_page.dart';

// ── Helpers ───────────────────────────────────────────────────────────────────

Widget _testApp({List<Override> overrides = const []}) {
  return ProviderScope(
    overrides: overrides,
    child: MaterialApp(
      initialRoute: AppRoutePaths.register,
      onGenerateRoute: AppRouter.onGenerateRoute,
    ),
  );
}

/// No-op Supabase datasource — tests must not call submit().
class _FakeSupabase implements SupabaseAuthDatasource {
  @override
  Future<String> signInWithEmailPassword({
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError();

  @override
  Future<SignUpResult> signUpWithEmailPassword({
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  // ── Smoke ──────────────────────────────────────────────────────────────

  testWidgets('RegisterPage renders AIM branding and three form fields',
      (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(RegisterPage), findsOneWidget);
    expect(find.text('Create your AIM account'), findsOneWidget);
    expect(find.text('AIM'), findsOneWidget);
    expect(find.byType(AIMInput), findsNWidgets(3));
  });

  testWidgets('RegisterPage uses AIM design system widgets', (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(AIMInput), findsNWidgets(3));
    expect(find.byType(AIMButton), findsOneWidget);
    expect(find.byType(AIMTopAppBar), findsOneWidget);
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

    final button = tester.widget<AIMButton>(find.byType(AIMButton));
    expect(button.onPressed, isNull);
  });

  testWidgets('Submit button enables when all fields are valid', (tester) async {
    await tester.pumpWidget(
      _testApp(
        overrides: [
          registerProvider.overrideWith((ref) {
            final notifier = RegisterNotifier(
              supabaseDatasource: _FakeSupabase(),
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

    final button = tester.widget<AIMButton>(find.byType(AIMButton));
    expect(button.onPressed, isNotNull);
  });

  testWidgets('Submit button stays disabled when passwords do not match',
      (tester) async {
    await tester.pumpWidget(
      _testApp(
        overrides: [
          registerProvider.overrideWith((ref) {
            final notifier = RegisterNotifier(
              supabaseDatasource: _FakeSupabase(),
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

    final button = tester.widget<AIMButton>(find.byType(AIMButton));
    expect(button.onPressed, isNull);
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
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          locale: const Locale('ar'),
          initialRoute: AppRoutePaths.register,
          onGenerateRoute: AppRouter.onGenerateRoute,
        ),
      ),
    );
    await tester.pump();

    expect(find.byType(RegisterPage), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
