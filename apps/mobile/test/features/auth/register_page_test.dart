import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/routing.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
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

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  // ── Smoke ──────────────────────────────────────────────────────────────

  testWidgets('RegisterPage renders the header and form fields',
      (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(RegisterPage), findsOneWidget);
    expect(find.text('Create an account'), findsOneWidget);
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
  });

  // ── Error banner ───────────────────────────────────────────────────────

  testWidgets('Error banner is hidden by default', (tester) async {
    await tester.pumpWidget(_testApp());
    await tester.pump();

    expect(find.byType(AIMAlertBanner), findsNothing);
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
