import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/routing.dart';
import 'package:aim_mobile/features/shell/ui/pages/main_shell_page.dart';
import 'package:aim_mobile/features/auth/data/session/session_store.dart';
import 'package:aim_mobile/features/auth/logic/provider/app_bootstrap_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/app_bootstrap_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/session_store_provider.dart';

void main() {
  // ── AppBootstrapNotifier unit tests ──────────────────────────

  test('AppBootstrapNotifier starts in checking state', () async {
    final container = ProviderContainer(
      overrides: [
        sessionStoreProvider.overrideWithValue(_FakeSessionStore()),
      ],
    );
    addTearDown(container.dispose);

    // Synchronously read — should start checking before the microtask runs.
    expect(
      container.read(appBootstrapProvider),
      AppBootstrapStatus.checking,
    );
  });

  test('AppBootstrapNotifier resolves to done and sets authFlow to signedOut',
      () async {
    final container = ProviderContainer(
      overrides: [
        sessionStoreProvider.overrideWithValue(_FakeSessionStore()),
      ],
    );
    addTearDown(container.dispose);

    container.read(appBootstrapProvider);

    // Allow the microtask in checkSession to complete.
    await Future<void>.delayed(Duration.zero);

    expect(container.read(appBootstrapProvider), AppBootstrapStatus.done);
    expect(container.read(authFlowProvider).isSignedOut, isTrue);
  });

  // ── AuthGate widget tests ─────────────────────────────────

  testWidgets(
      'AuthGate navigates to sign-in when bootstrap is done and signedOut',
      (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          // Bootstrap already done; auth state is signedOut.
          appBootstrapProvider.overrideWith(
              (ref) => _ImmediateDoneNotifier(ref)),
          authFlowProvider.overrideWith((ref) {
            final n = AuthFlowNotifier();
            n.completeBootstrap(); // → signedOut
            return n;
          }),
        ],
        child: const MaterialApp(
          initialRoute: AppRoutePaths.splash,
          onGenerateRoute: AppRouter.onGenerateRoute,
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Welcome back'), findsOneWidget);
  });

  testWidgets('AuthGate stays on splash while still checking', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          // Bootstrap stuck in checking — gate must not navigate.
          appBootstrapProvider.overrideWith(
              (ref) => _StuckCheckingNotifier(ref)),
        ],
        child: const MaterialApp(
          initialRoute: AppRoutePaths.splash,
          onGenerateRoute: AppRouter.onGenerateRoute,
        ),
      ),
    );

    await tester.pump();

    expect(find.text('AIM'), findsOneWidget);
    expect(find.text('Welcome back'), findsNothing);
  });

  testWidgets('AuthGate navigates to mainShell when already signed in',
      (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          appBootstrapProvider.overrideWith(
              (ref) => _ImmediateDoneNotifier(ref)),
          authFlowProvider.overrideWith((ref) {
            return AuthFlowNotifier()
              ..signIn('learner@example.com', accessToken: 'tok-abc');
          }),
        ],
        child: const MaterialApp(
          initialRoute: AppRoutePaths.splash,
          onGenerateRoute: AppRouter.onGenerateRoute,
        ),
      ),
    );

    // pump() instead of pumpAndSettle() because MainShellPage renders
    // AIMSkeleton loaders with a repeating animation that never settles.
    await tester.pump();
    await tester.pump();

    // Bottom tab bar was removed (navigation is via the drawer only) —
    // confirm the shell itself mounted instead.
    expect(find.byType(MainShellPage), findsOneWidget);
  });
}

// ── Test doubles ─────────────────────────────────────────

/// Resolves immediately to done without hitting any async path.
class _ImmediateDoneNotifier extends AppBootstrapNotifier {
  _ImmediateDoneNotifier(super.ref);

  @override
  Future<void> checkSession() async {
    if (mounted) state = AppBootstrapStatus.done;
  }
}

class _FakeSessionStore implements SessionStore {
  @override
  Future<void> clear() async {}

  @override
  Future<SessionData?> read() async => null;

  @override
  Future<void> save({
    required String accessToken,
    required String refreshToken,
    required int expiresAt,
    required String email,
  }) async {}
}

/// Stays in checking indefinitely — simulates a slow network.
class _StuckCheckingNotifier extends AppBootstrapNotifier {
  _StuckCheckingNotifier(super.ref);

  @override
  Future<void> checkSession() async {
    // Never resolves — gate must not navigate.
  }
}
