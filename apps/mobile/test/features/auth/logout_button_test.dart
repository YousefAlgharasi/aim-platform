import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/logout_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/logout_notifier.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
import 'package:aim_mobile/features/auth/ui/widgets/logout_button.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/auth_sync_response_model.dart';
import 'package:aim_mobile/features/auth/data/models/login_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/refresh_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/register_result_model.dart';

// ── Helpers ───────────────────────────────────────────────────────────────────

class _NoOpAuthRepository implements AuthRepository {
  @override
  Future<AuthContextModel> getMe(String token) async =>
      throw UnimplementedError();

  @override
  Future<AuthSyncResponseModel> syncUser(String t,
          {String? preferredLanguage, String? timezone}) async =>
      throw UnimplementedError();

  @override
  Future<void> logout(String token) async {}

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

Widget _wrap(Widget child, {List<Override> overrides = const []}) {
  return ProviderScope(
    overrides: overrides,
    child: MaterialApp(home: Scaffold(body: Center(child: child))),
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  testWidgets('LogoutButton renders with AIMButton destructive variant',
      (tester) async {
    await tester.pumpWidget(_wrap(const LogoutButton()));
    await tester.pump();

    final btn = tester.widget<AIMButton>(find.byType(AIMButton));
    expect(btn.variant, AIMButtonVariant.destructive);
    expect(find.text('Sign Out'), findsOneWidget);
  });

  testWidgets('LogoutButton is enabled when not logging out', (tester) async {
    await tester.pumpWidget(_wrap(const LogoutButton()));
    await tester.pump();

    final btn = tester.widget<AIMButton>(find.byType(AIMButton));
    expect(btn.onPressed, isNotNull);
    expect(btn.loading, isFalse);
  });

  testWidgets('LogoutButton shows loading state when logout is in progress',
      (tester) async {
    await tester.pumpWidget(
      _wrap(
        const LogoutButton(),
        overrides: [
          logoutProvider.overrideWith(
            (ref) => _LoadingLogoutNotifier(ref),
          ),
        ],
      ),
    );
    await tester.pump();

    final btn = tester.widget<AIMButton>(find.byType(AIMButton));
    expect(btn.loading, isTrue);
    expect(btn.onPressed, isNull);
  });

  testWidgets('LogoutButton fullWidth defaults to true', (tester) async {
    await tester.pumpWidget(_wrap(const LogoutButton()));
    await tester.pump();

    final btn = tester.widget<AIMButton>(find.byType(AIMButton));
    expect(btn.fullWidth, isTrue);
  });

  testWidgets('LogoutButton renders without errors under Arabic RTL locale',
      (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          locale: Locale('ar'),
          home: Scaffold(body: Center(child: LogoutButton())),
        ),
      ),
    );
    await tester.pump();

    expect(find.byType(LogoutButton), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}

/// Notifier stuck in loading state.
class _LoadingLogoutNotifier extends LogoutNotifier {
  _LoadingLogoutNotifier(Ref ref)
      : super(repository: _NoOpAuthRepository(), ref: ref) {
    setLoading();
  }
}
