import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/routing.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_results.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
import 'package:aim_mobile/features/auth/ui/pages/forgot_password_page.dart';

import '../../support/test_router_app.dart';

class _FakeAuthRepository implements AuthRepository {
  bool shouldFail = false;
  String? requestedEmail;

  @override
  Future<void> requestPasswordReset({required String email}) async {
    requestedEmail = email;
    if (shouldFail) {
      throw Exception('Failed to send reset link. User not found.');
    }
  }

  @override
  Future<AuthContext> getMe(String bearerToken) => throw UnimplementedError();

  @override
  Future<AuthSyncResult> syncUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
  }) =>
      throw UnimplementedError();

  @override
  Future<AuthLoginResult> login({required String email, required String password}) =>
      throw UnimplementedError();

  @override
  Future<AuthLoginResult> loginAsTestUser({required String role}) =>
      throw UnimplementedError();

  @override
  Future<AuthRefreshResult> refresh({required String refreshToken}) =>
      throw UnimplementedError();

  @override
  Future<AuthRegisterResult> register({
    required String email,
    required String password,
  }) =>
      throw UnimplementedError();

  @override
  Future<void> logout(String bearerToken) => throw UnimplementedError();
}

Widget _testApp({List<Override> overrides = const []}) {
  return ProviderScope(
    overrides: [
      authFlowProvider.overrideWith((ref) => AuthFlowNotifier()..completeBootstrap()),
      ...overrides,
    ],
    child: const TestRouterApp(
      initialLocation: AppRoutePaths.forgotPassword,
    ),
  );
}

void main() {
  group('ForgotPasswordPage', () {
    late _FakeAuthRepository fakeRepo;

    setUp(() {
      fakeRepo = _FakeAuthRepository();
    });

    testWidgets('renders email field and send reset link button', (tester) async {
      await tester.pumpWidget(_testApp(overrides: [
        authRepositoryProvider.overrideWithValue(fakeRepo),
      ]));
      await tester.pumpAndSettle();

      expect(find.text('FORGOT PASSWORD?'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
      expect(find.text('Send Reset Link'), findsOneWidget);
      expect(find.text('Back to Sign In'), findsOneWidget);
    });

    testWidgets('submitting valid email displays confirmation step', (tester) async {
      await tester.pumpWidget(_testApp(overrides: [
        authRepositoryProvider.overrideWithValue(fakeRepo),
      ]));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField), 'student@example.com');
      await tester.tap(find.text('Send Reset Link'));
      await tester.pumpAndSettle();

      expect(fakeRepo.requestedEmail, 'student@example.com');
      expect(find.text('Check Your Email'), findsOneWidget);
      expect(find.text('student@example.com'), findsOneWidget);
    });

    testWidgets('submitting when repo fails displays error message', (tester) async {
      fakeRepo.shouldFail = true;

      await tester.pumpWidget(_testApp(overrides: [
        authRepositoryProvider.overrideWithValue(fakeRepo),
      ]));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField), 'unknown@example.com');
      await tester.tap(find.text('Send Reset Link'));
      await tester.pumpAndSettle();

      expect(find.text('Failed to send reset link. User not found.'), findsOneWidget);
    });
  });
}
